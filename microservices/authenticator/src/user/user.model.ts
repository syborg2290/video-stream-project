import * as mongoose from 'mongoose';

export const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  //TODO private key shouldn't be store in database
  key: { type: String, required: true },
  iv: { type: String, required: true },
});

export interface User {
  _id: string;
  username: string;
  password: string;
  key: string;
  iv: string;
}
