import { Request, Response } from 'express';
import { HTTP_STATUS } from '../constants/http-status';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/user.model';


const registerUser = async (req: Request, res: Response) => {
    try {

        const { username, email, password, profileSlug } = req.body;

        // Check if the user already exists 
        const existingUser = await User.findOne({ $or: [{ email }, { profileSlug }] });
        if (existingUser) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: 'User already exists' });
        }

        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{6,}$/;
        if (!passwordRegex.test(password)) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: 'Password must be at least 6 characters long and contain at least one letter, one number, and one special character' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user
        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            profileSlug,
        });

        await newUser.save();

        res.status(HTTP_STATUS.CREATED).json({ message: 'User registered successfully' });


    } catch (error) {
        console.error('Error registering user:', error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: 'Error registering user' });
    }
}

const loginUser = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        // Check if the user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(HTTP_STATUS.UNAUTHORIZED).json({ message: 'Invalid email or password' });
        }

        // Compare the provided password with the hashed password in the database
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(HTTP_STATUS.UNAUTHORIZED).json({ message: 'Invalid email or password' });
        }

        // If login is successful, you can generate a token or perform other actions here

        const token = jwt.sign({ id: user._id.toString() }, process.env.JWT_SECRET || '068406', { expiresIn: '1h' });

        res.status(HTTP_STATUS.OK).json({ message: 'Login successful', token });
    } catch (error) {
        console.error('Error logging in user:', error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: 'Error logging in user' });
    }
}

const getCurrentUser = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id; // Assuming you have a middleware that sets req.user

        if (!userId) {
            return res.status(HTTP_STATUS.UNAUTHORIZED).json({ message: 'Unauthorized' });
        }

        const user = await User.findById(userId).select('-password'); // Exclude password from the response

        if (!user) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ message: 'User not found' });
        }

        res.status(HTTP_STATUS.OK).json({ user });
    } catch (error) {
        console.error('Error fetching current user:', error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: 'Error fetching current user' });
    }
};

export { registerUser, loginUser, getCurrentUser };
