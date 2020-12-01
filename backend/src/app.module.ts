import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { join } from 'path';
import { RetaurantsModule } from './retaurants/retaurants.module';

@Module({
  imports: [
    GraphQLModule.forRoot({
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'), // or true
    }),
    RetaurantsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
