import { Controller, Get, Res } from '@nestjs/common';
import { type Response } from 'express';
import { join } from 'path';

@Controller('privacy-policy')
export class PolicyController {
  @Get("en")
  privacyPolicyEn(@Res() res: Response) {
    return res.sendFile(join(__dirname,'../../../','static','privacy_policy_en.html'));
  }
  @Get("tr")
  privacyPolicyTr(@Res() res: Response) {
    return res.sendFile(join(__dirname,'../../../','static','privacy_policy_tr.html'));
  }
}
