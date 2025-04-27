import z from "zod";

const regex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@$!%*?&])([A-Za-z\d$@$!%*?&]|[^ ]){8,15}$/;

const userSchema = z.object({
  username: z
    .string({
      required_error: "Username is required",
      invalid_type_error: "Username must be a string",
    })
    .min(5, { message: "Must be 5 or more characters long" })
    .max(50, { message: "Must be 50 or fewer characters long" }),

  email: z
    .string({
      invalid_type_error: "Email must be a string",
      required_error: "Email is required",
    })
    .email({ message: "Invalid email format" }),

  password: z.string({ required_error: "Password is required" }).regex(regex, {
    message:
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and be at least 8 characters long",
  }),
});

export function validateUser(user) {
  return userSchema.safeParse(user);
}

export function validateLogin(user) {
  return userSchema.pick({ email: true, password: true }).safeParse(user);
}

export function validateUpdate(user) {
  return userSchema.partial().safeParse(user);
}
