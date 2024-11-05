/* eslint-disable security/detect-object-injection */
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { CustomParamFactory } from '@nestjs/common/interfaces';
import { DECORATORS } from '@nestjs/swagger/dist/constants';

const DEFAULT_PAGE = 1;
const DEFAULT_TAKE = 10;
const MAX_TAKE = 400;

export class PaginationDto {
  page: number;
  skip: number;
  take: number;
}

export const paginationDecoratorFactory: CustomParamFactory = (
  _data: unknown,
  ctx: ExecutionContext,
) => {
  const request = ctx.switchToHttp().getRequest();

  const page = Math.abs(Number(request.query.page) || DEFAULT_PAGE);
  let take = Math.abs(Number(request.query.take) || DEFAULT_TAKE);

  if (take > MAX_TAKE) {
    take = MAX_TAKE;
  }

  const skip = (page - 1) * take;

  const pagination = new PaginationDto();
  pagination.page = page;
  pagination.skip = skip;
  pagination.take = take;

  delete request.query.page;
  delete request.query.take;

  return pagination;
};

export const Pagination = createParamDecorator(paginationDecoratorFactory, [
  (target, key) => {
    const explicit =
      Reflect.getMetadata(DECORATORS.API_PARAMETERS, target[key]) ?? [];
    Reflect.defineMetadata(
      DECORATORS.API_PARAMETERS,
      [
        ...explicit,
        {
          description: 'Page',
          in: 'query',
          name: 'page',
          required: false,
          type: 'string',
        },
        {
          description: 'Take',
          in: 'query',
          name: 'take',
          required: false,
          type: 'string',
        },
      ],
      target[key],
    );
  },
]);
