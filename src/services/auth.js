import UserCollection from '../db/models/User.js';
import SessionCollection from '../db/models/Session.js';
import createHttpError from 'http-errors';
import bcrypt from 'bcrypt';

export const register = async (payload) => {
    const { email, password} = payload;
    const user = await UserCollection.findOne({ email });
    if (user) {
      throw createHttpError(409, 'Email already in use');
    }
  
    const hashPassword = await bcrypt.hash(password, 10);
  
    return UserCollection.create({ ...payload, password: hashPassword });
  };
export const login = async ({ email, password }) => {
    const user = await UserCollection.findOne({ email });
    if (!user) {
      throw createHttpError(401, 'Email or password invalid');
    }
  
    const passwordCompare = await bcrypt.compare(password, user.password);
    if (!passwordCompare) {
      throw createHttpError(401, 'Email or password invalid');
    }
  
    await SessionCollection.deleteOne({ userId: user._id });
  
    const newSession = createSession();
    user.accessToken = newSession.accessToken;
    await user.save();
  
    return SessionCollection.create({
      userId: user._id,
      ...newSession,
    });
  };
export const logoutUser = async (userId, token) => {
    return await UserCollection.findByIdAndUpdate(userId, {
      $pull: { tokens: token },
    });
  };