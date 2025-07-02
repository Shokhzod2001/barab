import mongoose, { Schema } from "mongoose";
import {
  MemberShift,
  MemberStatus,
  MemberType,
} from "../libs/enums/member.enum";

// 2 ways of building Schema Model => Schema first(Schema based) & Code first(code based)
const memberSchema = new Schema(
  {
    memberType: {
      type: String,
      enum: MemberType,
      default: MemberType.USER,
    },

    memberStatus: {
      type: String,
      enum: MemberStatus,
      default: MemberStatus.ACTIVE,
    },

    memberNick: {
      type: String,
      index: { unique: true, sparse: true },
      required: true,
    },

    memberPhone: {
      type: String,
      index: { unique: true, sparse: true },
      required: true,
    },

    memberPassword: {
      type: String,
      select: false,
      required: true,
    },

    memberAddress: {
      type: String,
    },

    memberDesc: {
      type: String,
    },

    memberImage: {
      type: String,
    },

    memberExperience: {
      type: Number, // in years
      min: 0,
      default: 0,
    },

    memberShift: {
      type: String,
      enum: MemberShift,
    },

    memberPoints: {
      type: Number,
      default: 0,
    },

    googleId: {
      type: String,
      sparse: true, // Allows multiple null values
      unique: true, // But ensures uniqueness when not null
    },
  },
  { timestamps: true } // createdAt, updatedAt
);

memberSchema.index({ googleId: 1 });

export default mongoose.model("Member", memberSchema);
