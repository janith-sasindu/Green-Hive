import type { Request, Response } from 'express';
import { currentUser } from '../middleware/auth';
import { getCurrentUser, loginUser, registerUser } from '../services/auth.service';
import { Validator } from '../utils/validator';

const REGISTRABLE_ROLES = ['FARMER', 'SELLER', 'TRANSPORTER'] as const;
const MIN_PASSWORD_LENGTH = 8;
// bcrypt only uses the first 72 bytes of a password
const MAX_PASSWORD_LENGTH = 72;

export async function register(req: Request, res: Response): Promise<void> {
  const body = Validator.of(req.body);
  const role = body.oneOf('role', REGISTRABLE_ROLES);
  const input = {
    role,
    name: body.string('name', { max: 120 }),
    email: body.email('email'),
    phone: body.phone('phone'),
    password: body.string('password', { max: MAX_PASSWORD_LENGTH }),
    location: body.optionalString('location', { max: 120 }),
    businessName: role === 'SELLER' ? body.string('businessName', { max: 150 }) : undefined,
    address: body.optionalString('address'),
  };
  if (input.password !== '' && input.password.length < MIN_PASSWORD_LENGTH) {
    body.fail('password', `Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
  }
  body.assertValid();

  res.status(201).json(await registerUser(input));
}

export async function login(req: Request, res: Response): Promise<void> {
  const body = Validator.of(req.body);
  const email = body.email('email');
  const password = body.string('password', { max: MAX_PASSWORD_LENGTH });
  body.assertValid();

  res.json(await loginUser(email, password));
}

export async function me(req: Request, res: Response): Promise<void> {
  res.json({ user: await getCurrentUser(currentUser(req).id) });
}
