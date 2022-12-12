import { Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import mongoose from 'mongoose';
import sharp from 'sharp';
import { BadRequestError, NotFoundError } from '../errors/errors.js';
import Avatar from '../models/Avatar.js';
import User from '../models/User.js';

const getProfile = async (req: any, res: Response) => {
  const id = req.params.id === 'me' ? req.user._id : req.params.id;

  const user = await User.findById(id);
  if (!user) {
    throw new BadRequestError('No user found');
  }
  const userProfile = await user.getFullProfile(req.user._id);

  res.send(userProfile);
};

const updateProfile = async (req: any, res: Response) => {
  const updateInfo = req.body;
  const updatableParams = [
    'displayName',
    'bio',
    'birthdate',
    'location',
    'website',
  ];
  const canUpdate = Object.keys(updateInfo).every((updateKey: string) =>
    updatableParams.includes(updateKey)
  );
  if (!canUpdate) {
    throw new BadRequestError('Incorrect update parameters');
  }
  const updatedUser = await User.findByIdAndUpdate(req.user._id, updateInfo, {
    upsert: true,
    new: true,
  });
  res.send('Update success');
};

const followUser = async (req: any, res: Response) => {
  const { followId } = req.params;
  const user = req.user;
  if (followId === user._id.toString()) {
    throw new BadRequestError('Cannot follow yourself.');
  }

  await User.findByIdAndUpdate(user._id, {
    $addToSet: { following: followId },
  });
  const followedUser = await User.findByIdAndUpdate(
    followId,
    { $addToSet: { followers: user._id } },
    { new: true }
  );

  if (!followedUser) {
    throw new BadRequestError('User not found');
  }
  res.status(200).send(followedUser);
};

const unfollowUser = async (req: any, res: Response) => {
  const { unfollowId } = req.params;
  const user = req.user;
  if (unfollowId === user._id.toString()) {
    throw new BadRequestError('Cannot follow yourself.');
  }

  await User.findByIdAndUpdate(user._id, {
    $pull: { follwing: unfollowId },
  });
  const unfollowedUser = await User.findByIdAndUpdate(
    unfollowId,
    { $pull: { followers: user._id } },
    { new: true }
  );

  if (!unfollowedUser) {
    throw new BadRequestError('User not found');
  }
  res.status(200).send(unfollowedUser);
};

const getAvatar = async (req: any, res: Response) => {
  const { avatarId } = req.params;
  const avatar = await Avatar.findById(avatarId);
  if (!avatar) {
    throw new NotFoundError('Cannot get resource');
  }
  res.set('Content-Type', 'image/png');
  res.status(StatusCodes.CREATED).send(avatar.data);
};

const postAvatar = async (req: any, res: Response) => {
  const avatarBuffer = await sharp(req.file.buffer)
    .resize({ width: 250, height: 250 })
    .png()
    .toBuffer();
  const avatar = await Avatar.create({ data: avatarBuffer });
  if (req.user.avatarId) {
    await Avatar.findByIdAndDelete(req.user.avatarId);
  }
  req.user.avatarId = avatar._id;
  await req.user.save();
  res.set('Content-Type', 'image/png');
  res.status(StatusCodes.CREATED).send(avatar.data);
};

const deleteAvatar = async (req: any, res: Response) => {
  await Avatar.findByIdAndDelete(req.user.avatarId);
  req.user.avatarId = undefined;
  await req.user.save();
  res.status(StatusCodes.OK).send({ msg: 'avatar deleted' });
};

export {
  followUser,
  unfollowUser,
  getProfile,
  updateProfile,
  getAvatar,
  postAvatar,
  deleteAvatar,
};