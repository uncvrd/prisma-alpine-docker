import { BadRequestException, Injectable } from '@nestjs/common';
import { Link } from '@prisma/client';
import { strstr } from '../utils/helpers';
import crypto from 'crypto-random-string';
import { CreateLinkDTO, UpdateLinkDTO } from '../models/linkDTO';
import { MAXIMUM_LINK_LENGTH } from 'src/utils/constants';
import { PrismaService } from './prisma.service';

@Injectable()
export class LinkService {
  // eslint-disable-next-line prettier/prettier
  constructor(private prisma: PrismaService) { }

  async getLink(shortUrl: string): Promise<Link | null> {
    return await this.prisma.link.findUnique({
      where: {
        shortUrl,
      },
    });
  }

  checkIfAlreadyShortened(longUrl: string): boolean {
    const shortenerDomains = [
      'polr.me',
      'bit.ly',
      'is.gd',
      'tiny.cc',
      'adf.ly',
      'ur1.ca',
      'goo.gl',
      'ow.ly',
      'j.mp',
      't.co',
      process.env.APP_DOMAIN,
    ];

    for (const shortenerDomain of shortenerDomains) {
      const url_segment = `://${shortenerDomain}`;
      if (strstr(longUrl, url_segment)) {
        return true;
      }
    }

    return false;
  }

  async linkExists(customEnding: string) {
    const link = await this.prisma.link.findFirst({
      where: {
        shortUrl: customEnding,
      },
    });

    return link;
  }

  async longLinkExists(longUrl: string): Promise<string | undefined> {
    const link = await this.prisma.link.findFirst({
      where: {
        longUrl,
      },
    });

    return link?.shortUrl;
  }

  validateEnding(linkEnding: string): boolean {
    const regex = /^[a-zA-Z0-9-_]+$/;
    if (linkEnding.search(regex) === -1) {
      return false;
    } else {
      return true;
    }
  }

  async findPseudoRandomEnding() {
    let pr_str = '';
    let inUse = true;

    while (inUse) {
      pr_str = crypto({
        length: Number(process.env.PSEUDO_RANDOM_KEY_LENGTH) ?? 5,
        type: 'url-safe',
      });

      inUse = (await this.linkExists(pr_str)) ? true : false;
    }

    return pr_str;
  }

  async formatLink(linkEnding: string) {
    return `${process.env.APP_DOMAIN}/${linkEnding}`;
  }

  async createLink(data: CreateLinkDTO): Promise<string> {
    if (data.url.length > MAXIMUM_LINK_LENGTH) {
      throw new BadRequestException(
        'Your link is longer than the maximum length allowed',
      );
    }

    const isAlreadyShort = this.checkIfAlreadyShortened(data.url);

    if (isAlreadyShort) {
      throw new BadRequestException('Link has already been shortened!');
    }

    const existingLink = await this.longLinkExists(data.url);

    if (!data.custom_ending && !!existingLink) {
      return this.formatLink(existingLink);
    }

    let linkEnding: string;

    if (data.custom_ending) {
      const endingConforms = this.validateEnding(data.custom_ending);

      if (!endingConforms) {
        throw new BadRequestException(
          'Custom endings can only contain alphanumeric characters, hyphens, and underscores.',
        );
      }

      const endingInUse = await this.linkExists(data.custom_ending);

      if (endingInUse) {
        throw new BadRequestException('This URL ending is already in use.');
      }

      linkEnding = data.custom_ending;
    } else {
      linkEnding = await this.findPseudoRandomEnding();
    }

    await this.prisma.link.create({
      data: {
        longUrl: data.url,
        shortUrl: linkEnding,
        isCustom: !!data.custom_ending,
      },
    });

    return this.formatLink(linkEnding);
  }

  async updateLink(data: UpdateLinkDTO) {
    if (data.url.length > MAXIMUM_LINK_LENGTH) {
      throw new BadRequestException(
        'Your link is longer than the maximum length allowed',
      );
    }

    const isAlreadyShort = this.checkIfAlreadyShortened(data.url);

    if (isAlreadyShort) {
      throw new BadRequestException('Link has already been shortened!');
    }

    const existingLink = await this.longLinkExists(data.url);

    if (!data.custom_ending && !!existingLink) {
      return this.formatLink(existingLink);
    }

    await this.prisma.link.update({
      where: {
        shortUrl: data.custom_ending,
      },
      data: {
        longUrl: data.url,
      },
    });

    return this.formatLink(data.custom_ending);
  }

  async deleteLink(urlEnding: string) {
    if (!urlEnding) {
      throw new BadRequestException('Ending not supplied for deletion');
    }

    await this.prisma.link.delete({
      where: {
        shortUrl: urlEnding,
      },
    });

    return this.formatLink(urlEnding);
  }
}
