import { faker } from '@faker-js/faker';

export const mockDealer = () => {
  return {
    name: faker.company.name()
  }
}