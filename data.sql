DROP DATABASE IF EXISTS biztime;

CREATE DATABASE biztime;

\c biztime

DROP TABLE IF EXISTS invoices;
DROP TABLE IF EXISTS companies;
DROP TABLE IF EXISTS industries;
DROP TABLE IF EXISTS company_industries;

CREATE TABLE companies (
    code text PRIMARY KEY,
    name text NOT NULL UNIQUE,
    description text
);

CREATE TABLE invoices (
    id serial PRIMARY KEY,
    comp_code text NOT NULL REFERENCES companies ON DELETE CASCADE,
    amt float NOT NULL,
    paid boolean DEFAULT false NOT NULL,
    add_date date DEFAULT CURRENT_DATE NOT NULL,
    paid_date date,
    CONSTRAINT invoices_amt_check CHECK ((amt > (0)::double precision))
);

CREATE TABLE industries (
    code text PRIMARY KEY,
    industry text NOT NULL
);

CREATE TABLE company_industries (
    company_code text NOT NULL REFERENCES companies(code) ON DELETE CASCADE,
    industry_code text NOT NULL REFERENCES industries(code) ON DELETE CASCADE,
    PRIMARY KEY (company_code, industry_code)
);

-- Insert sample data into companies
INSERT INTO companies
  VALUES ('apple', 'Apple Computer', 'Maker of OSX.'),
         ('ibm', 'IBM', 'Big blue.');

-- Insert sample data into invoices
INSERT INTO invoices (comp_code, amt, paid, paid_date)
  VALUES ('apple', 100, false, null),
         ('apple', 200, false, null),
         ('apple', 300, true, '2018-01-01'),
         ('ibm', 400, false, null);

-- Insert sample data into industries
INSERT INTO industries
  VALUES ('tech', 'Technology'),
         ('acct', 'Accounting'),
         ('fin', 'Finance');

-- Insert sample data into company_industries (many-to-many relationships)
INSERT INTO company_industries
  VALUES ('apple', 'tech'),
         ('ibm', 'tech'),
         ('ibm', 'fin');
