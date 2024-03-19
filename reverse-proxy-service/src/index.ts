import { logger } from '@/utils/logger';

const object = {
  myname: 'siddharth',
  your: {
    name: 'siddharth',
    age: 34
  }
};

async function hello (): Promise<void> {
  for (let i = 0; i < 5; i++) {
    setTimeout(() => {
      logger.debug('Hello World', object);
    }, 1000 * i);
  }
}

await hello();
export { hello };
