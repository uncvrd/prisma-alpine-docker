import { Module } from '@nestjs/common';
import { AppController } from './controllers/app.controller';
import { LinkController } from './controllers/link.controller';
import { AppService } from './services/app.service';
import { LinkService } from './services/link.service';
import { PrismaService } from './services/prisma.service';

@Module({
  imports: [],
  controllers: [AppController, LinkController],
  providers: [
    PrismaService,
    AppService,
    LinkService,
    // {
    //   provide: APP_GUARD,
    //   useClass: FirebaseAuthGuard,
    // },
  ],
})
// eslint-disable-next-line prettier/prettier
export class AppModule { }
