import { Body, Controller, Get, Post, Query, UseGuards, ValidationPipe } from "@nestjs/common";
import { AppInfoService } from "./app-info.service";
import { type AboutUsDto } from "@models/about/about-us-dto";
import { type CoreResponse } from "@core/types/core-response";
import { type SupportDto } from "@models/support/support-dto";
import { type LanguageDto } from "@models/language/language-dto";
import { type LanguagePair } from "@models/language/language-pair";
import { AdminGuard } from "@guards/admin.guard";

@Controller("appInfo")
export class AppInfoController {
  constructor(private readonly service: AppInfoService) {  }

  @Get("aboutUs")
  async getAboutUs(): Promise<CoreResponse<AboutUsDto>> {
    return this.service.getAboutUs();
  }

  @Get("support")
  async support(): Promise<CoreResponse<SupportDto>> {
    return this.service.support();
  }

  @Get("availableLanguages")
  async availableLanguages(): Promise<CoreResponse<LanguagePair[]>> {
    return this.service.availableLanguages();
  }
  
  @Get("language")
  async language(@Query("languageCode") code: string,@Query("hash") hash?: string): Promise<CoreResponse<LanguageDto>> {
    return this.service.language(code, hash);
  }

  @UseGuards(AdminGuard)
  @Post("language")
  async uploadLanguage(@Body(ValidationPipe) body: LanguageDto): Promise<CoreResponse<string>> {
    return this.service.uploadLanguage(body);
  }  
}
