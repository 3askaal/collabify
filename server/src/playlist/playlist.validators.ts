import { IsEmail, IsNotEmpty } from 'class-validator';
import { IsObjectId } from 'class-validator-mongo-object-id';

export class GetParams {
  @IsObjectId()
  id: string;
}

export class GetAllParams {
  @IsNotEmpty()
  id: string;

  @IsEmail()
  email: string;
}
