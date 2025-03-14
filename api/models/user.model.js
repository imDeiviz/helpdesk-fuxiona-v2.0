const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const SALT_WORK_FACTOR = 10;
const EMAIL_PATTERN =
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const PASSWORD_PATTERN = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "User name is required"],
      maxLength: [30, "User name characters must be lower than 30"],
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      required: [true, "User email is required"],
      match: [EMAIL_PATTERN, "Invalid user email pattern"],
    },
    password: {
      type: String,
      required: [true, "User password is required"],
      validate: {
        validator: function (v) {
          return PASSWORD_PATTERN.test(v);
        },
        message: (props) => `${props.value} is not a valid password!`,
      },
    },
    role: { type: String, enum: ["user", "admin", "tecnico"], default: "user" },

    office: {
      type: String,
      required: [true, "Office is required"],
      enum: ["Malaga", "Marbella", "Fuengirola"],

    },

  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        delete ret.__v;
        delete ret._id;
        delete ret.password;
        delete ret.activateToken;

        ret.id = doc.id;
        return ret;
      },
    },
  }
);

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

userSchema.methods.checkPassword = function (passwordToCheck) {
  return bcrypt.compare(passwordToCheck, this.password);
};

const User = mongoose.model("User", userSchema);
module.exports = User;
