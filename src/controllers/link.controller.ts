import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { Link } from '@prisma/client';
import { LinkService } from 'src/services/link.service';
import {
  CreateLinkDTO,
  EncodedResponse,
  UpdateLinkDTO,
} from '../models/linkDTO';

@Controller('link')
export class LinkController {
  // eslint-disable-next-line prettier/prettier
  constructor(private readonly linkService: LinkService) { }

  private encodeResponse(result: any, action: string) {
    const response: EncodedResponse = {
      action,
      result,
    };

    return response;
  }

  @Post('/shorten')
  async shortenLink(@Body('data') data: CreateLinkDTO) {
    if (!data?.url) {
      throw new BadRequestException('Missing URL Parameter!');
    }

    try {
      const newLink = await this.linkService.createLink(data);
      return this.encodeResponse(newLink, 'shorten');
    } catch (error) {
      console.log(error);
      throw new BadRequestException(error.message);
    }
  }

  @Post('/update')
  async updateLink(@Body('data') data: UpdateLinkDTO) {
    if (!data.custom_ending || !data.url) {
      throw new BadRequestException('URL was added not added to the request');
    }
    try {
      const updatedLink = await this.linkService.updateLink(data);
      return this.encodeResponse(updatedLink, 'update-link');
    } catch (error) {
      console.log(error);
      throw new BadRequestException(
        'An error occurred while updating a short link',
      );
    }
  }

  @Post('/delete/:url_ending')
  async deleteLink(@Param('url_ending') urlEnding: string) {
    if (!urlEnding) {
      throw new BadRequestException('No URL ending was added to the request');
    }
    try {
      const deletedLink = await this.linkService.deleteLink(urlEnding);
      return this.encodeResponse(deletedLink, 'delete-link');
    } catch (error) {
      console.log(error);
      throw new BadRequestException(
        'An error occurred while deleting a shortened link',
      );
    }
  }

  @Get('/lookup')
  async lookupLink(@Query('url_ending') urlEnding: string) {
    if (!urlEnding) {
      throw new BadRequestException('URL ending required!');
    }

    const regexp = /^[a-zA-Z0-9-_]+$/;
    const check = urlEnding;
    if (check.search(regexp) === -1) {
      throw new BadRequestException(
        'Only alphanumeric / dashes / underscores are allowed',
      );
    }

    let link: Link | null;

    try {
      link = await this.linkService.linkExists(urlEnding);
    } catch (error) {
      console.log(error);
      throw new BadRequestException(
        'An error occured while checking if the link exists',
      );
    }

    if (link) {
      return this.encodeResponse(link, 'lookup');
    } else {
      throw new NotFoundException('Link not found');
    }
  }
}
