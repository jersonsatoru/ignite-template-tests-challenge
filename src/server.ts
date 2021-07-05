import { app } from './app';

import getConnection from './database';

getConnection();

app.listen(3334, () => {
  console.log('Server is running');
});
