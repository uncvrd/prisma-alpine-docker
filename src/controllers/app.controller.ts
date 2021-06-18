import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Redirect,
} from '@nestjs/common';
import { LinkService } from 'src/services/link.service';

@Controller()
export class AppController {
  // eslint-disable-next-line prettier/prettier
  constructor(private readonly linkService: LinkService) { }

  @Get('/:short_url')
  @Redirect()
  async performRedirect(@Param('short_url') shortUrl: string) {
    const link = await this.linkService.getLink(shortUrl);

    if (link === null || link.isDisabled) {
      throw new NotFoundException();
    }

    return {
      url: link.longUrl,
      code: 301,
    };
  }
}
