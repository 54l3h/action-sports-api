import { model, Schema } from "mongoose";
import slugify from "slugify";
import bcrypt from "bcryptjs";

export const UserRoles = {
  ADMIN: "admin",
  USER: "user",
};

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
      required: [true, "Password should be unique"],
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
      default: true,
    },
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
