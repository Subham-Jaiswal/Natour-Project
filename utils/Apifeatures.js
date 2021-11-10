/* eslint-disable import/no-dynamic-require */
/* eslint-disable no-prototype-builtins */
class ApiFeatures {
  constructor(query, queryObj) {
    console.log('constructor');
    this.query = query;
    this.queryObj = queryObj;
  }

  advanceFilter() {
    const query = { ...this.queryObj };
    const ignoreQuery = ['page', 'sort', 'limit', 'fields'];
    ignoreQuery.forEach(el => {
      delete query[el];
    });
    let search = JSON.stringify(query);
    console.log('search se pehle');
    search = search.replace(/\b(gte|lte|gt|lt)\b/g, match => {
      return `$${match}`;
    });
    console.log(search);
    this.query = this.query.find(JSON.parse(search));
    return this;
    // const query = Tour.find(JSON.parse(search));
  }

  sort() {
    if (this.queryObj.hasOwnProperty('sort')) {
      const sortParameter = this.queryObj.sort.split(',').join(' ');
      console.log(sortParameter);
      // {query.sort(a b c)}; a,b,c being the parameter you want
      this.query = this.query.sort(sortParameter);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  fields() {
    console.log('fields');
    if (this.queryObj.hasOwnProperty('fields')) {
      const fieldParameter = this.queryObj.fields.split(',').join(' ');
      this.query = this.query.select(fieldParameter); // .select(fieldParameter) To Show  .search(-fieldparameter) .To Not show // Select false in schema to directly hide it
    }
    return this;
  }

  pagination() {
    console.log('pagination');
    const page = this.queryObj.page * 1 || 1;
    const limit = this.queryObj.limit * 1 || 100;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    console.log('pagination');
    return this;
  }
}

module.exports = ApiFeatures;
