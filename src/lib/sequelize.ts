/**
 * Sequelize module wrapper
 *
 * Provides a consistent interface for importing Sequelize
 * in both ESM and browser environments.
 */

const isBrowser = typeof window !== "undefined";

let Sequelize: any;
let DataTypes: any;
let Op: any;
let Model: any;
let QueryTypes: any;

if (isBrowser) {
  class MockSequelize {
    constructor() {
      console.warn("Sequelize is not available in browser environment");
    }
  }

  DataTypes = {
    STRING: "STRING",
    TEXT: "TEXT",
    INTEGER: "INTEGER",
    FLOAT: "FLOAT",
    BOOLEAN: "BOOLEAN",
    DATE: "DATE",
    UUID: "UUID",
    JSON: "JSON",
    JSONB: "JSONB",
  };

  Op = {
    eq: "eq",
    ne: "ne",
    is: "is",
    not: "not",
    or: "or",
    and: "and",
    gt: "gt",
    gte: "gte",
    lt: "lt",
    lte: "lte",
    between: "between",
    notBetween: "notBetween",
    in: "in",
    notIn: "notIn",
    like: "like",
    notLike: "notLike",
    startsWith: "startsWith",
    endsWith: "endsWith",
    substring: "substring",
    regexp: "regexp",
    notRegexp: "notRegexp",
    iRegexp: "iRegexp",
    notIRegexp: "notIRegexp",
    any: "any",
    all: "all",
    values: "values",
    col: "col",
    placeholder: "placeholder",
    join: "join",
  };

  class MockModel {
    static init() {
      console.warn("Model.init is not available in browser environment");
      return this;
    }
    static associate() {
      console.warn("Model.associate is not available in browser environment");
      return this;
    }
  }

  Sequelize = MockSequelize;
  Model = MockModel;
  QueryTypes = {
    SELECT: "SELECT",
    INSERT: "INSERT",
    UPDATE: "UPDATE",
    DELETE: "DELETE",
  };
} else {
  const sequelizeModule = await import('sequelize');
  Sequelize = sequelizeModule.Sequelize;
  DataTypes = sequelizeModule.DataTypes;
  Op = sequelizeModule.Op;
  Model = sequelizeModule.Model;
  QueryTypes = sequelizeModule.QueryTypes;
}

export { Sequelize, DataTypes, Op, Model, QueryTypes };
