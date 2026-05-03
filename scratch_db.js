const CategoryModel = require('./Backend/models/categoryModel');
require('dotenv').config({ path: './Backend/.env' });

async function testCategory() {
  try {
    const cats = await CategoryModel.getAllCategories();
    console.log('All categories:', cats.slice(0, 5));

    const ids = await CategoryModel.getCategoryAndChildrenIds(1);
    console.log('Category and children ids for 1:', ids);

    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}

testCategory();
