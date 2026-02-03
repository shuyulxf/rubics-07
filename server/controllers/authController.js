const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET =
	process.env.JWT_SECRET || 'your-secret-key-should-be-in-env-file';
const COOKIE_OPTIONS = {
	httpOnly: true,
	sameSite: 'lax',
	secure: false,
	maxAge: 30 * 24 * 60 * 60 * 1000,
	path: '/',
};

exports.register = async (req, res) => {
	try {
		const { username, email, password } = req.body;

		if (!username || !email || !password) {
			return res.status(400).json({
				message: 'Please provide username, email and password',
			});
		}

		const existingUser = await User.findOne({ email });
		if (existingUser) {
			return res.status(400).json({
				message: 'User already exists with this email',
			});
		}

		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);

		const newUser = await User.create({
			username,
			email,
			password: hashedPassword,
		});

		const token = jwt.sign({ id: newUser._id }, JWT_SECRET, {
			expiresIn: '30d',
		});

		res.cookie('token', token, COOKIE_OPTIONS);

		// Only return username and email
		const userToReturn = {
			username: newUser.username,
			email: newUser.email,
		};

		res.status(201).json({
			message: 'User registered successfully',
			user: userToReturn,
		});
	} catch (err) {
		console.error('Register error:', err);
		res.status(500).json({ message: 'Server error', error: err.message });
	}
};

exports.login = async (req, res) => {
	const { email, password } = req.body;

	if (!email || !password) {
		return res.status(400).json({
			message: 'Please provide email and password',
		});
	}

	try {
		const user = await User.findOne({ email });
		if (!user) {
			return res.status(401).json({ message: 'Invalid credentials' });
		}

		const isMatch = await bcrypt.compare(password, user.password);
		if (!isMatch) {
			return res.status(401).json({ message: 'Invalid credentials' });
		}

		const token = jwt.sign({ id: user._id }, JWT_SECRET, {
			expiresIn: '30d',
		});

		res.cookie('token', token, COOKIE_OPTIONS);

		const userToReturn = {
			username: user.username,
			email: user.email,
			avatar: user.avatar,
		};

		return res.status(200).json({
			message: 'Login successful',
			user: userToReturn,
		});
	} catch (err) {
		console.error('Login error:', err);
		res.status(500).json({ message: 'Server error', error: err.message });
	}
};

exports.logout = async (req, res) => {
	res.clearCookie('token', COOKIE_OPTIONS).json({ message: 'Logged out' });
};

exports.auth = async (req, res, next) => {
	const token = req.cookies.token;

	if (!token) {
		return res.status(401).json({
			message: 'Unauthorized - No token provided',
		});
	}

	try {
		const decoded = jwt.verify(token, JWT_SECRET); // Use JWT_SECRET consistently
		const user = await User.findById(decoded.id);

		if (!user) {
			return res.status(401).json({
				message: 'Unauthorized - User not found',
			});
		}

		req.user = user;
		next();
	} catch (err) {
		return res.status(401).json({
			message: 'Unauthorized - Invalid token',
		});
	}
};
