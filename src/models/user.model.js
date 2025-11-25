import { model, Schema, Types } from "mongoose";
import slugify from "slugify";
import bcrypt from "bcryptjs";

export const UserRoles = {
  ADMIN: "admin",
  USER: "user",
};

const addressSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["home", "work", "other"],
      default: "home",
    },
    details: String,
    phone: String,
    city: {
      type: Types.ObjectId,
      ref: "ShippingZone",
    },
    postalCode: String,
  },
  { _id: true }
);

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      lowercase: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: [true, "Email should be unique"],
      lowercase: true,
    },
    phone: String,
    password: {
      type: String,
      required: [true, "Password is required"],
      minLength: [6, "Password is too short"],
    },
    role: {
      type: String,
      enum: Object.values(UserRoles),
      default: UserRoles.USER,
      lowercase: true,
    },
    active: {
      type: Boolean,
      default: false,
    },
    activatedAt: Date,
    deactivatedAt: Date,
    passwordChangedAt: Date,
    passwordResetCode: String,
    passwordResetCodeExpiresAt: Date,
    passwordResetCodeVerified: Boolean,
    addresses: [addressSchema],
    shippingAddress: addressSchema,
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (this.isModified("name") || !this.slug) {
    this.slug = slugify(this.name);
  }

  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 8);
  }

  next();
});

userSchema.pre("findOneAndUpdate", async function (next) {
  const update = this.getUpdate();

  if (update.name) {
    update.slug = slugify(update.name);
  }

  if (update.password) {
    update.password = await bcrypt.hash(update.password, 8);
  }

  this.setUpdate(update);
  next();
});

userSchema.pre("updateOne", async function (next) {
  const update = this.getUpdate();

  if (update.name) {
    update.slug = slugify(update.name);
  }

  if (update.password) {
    update.password = await bcrypt.hash(update.password, 8);
  }

  this.setUpdate(update);
  next();
});

const UserModel = model("User", userSchema);

export default UserModel;
