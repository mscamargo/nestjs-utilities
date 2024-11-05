import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { CustomParamFactory } from '@nestjs/common/interfaces';

const DESC_SYMBOL = '-';

export const orderingDecoratorFactory: CustomParamFactory = (
  data: unknown,
  ctx: ExecutionContext,
): Record<string, 'ASC' | 'DESC'> => {
  const request = ctx.switchToHttp().getRequest();
  const orderByQuery: string | undefined = request.query.orderBy;

  if (!orderByQuery) {
    return {};
  }

  const fields = orderByQuery.split(',');

  delete request.query.orderBy;

  return fields.reduce<Record<string, 'ASC' | 'DESC'>>((acc, field) => {
    let order: 'ASC' | 'DESC' = 'ASC';
    let fieldName = field;

    if (field.startsWith(DESC_SYMBOL)) {
      fieldName = field.slice(1);
      order = 'DESC';
    }

    return {
      ...acc,
      [fieldName]: order,
    };
  }, {});
};

export const Ordering = createParamDecorator(orderingDecoratorFactory);
