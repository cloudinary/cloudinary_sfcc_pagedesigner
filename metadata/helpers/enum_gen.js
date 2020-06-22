#!/usr/bin/env node

const argv = require('yargs').argv;
const fs = require('fs');

const defTemplate = `<value-definition>
<display xml:lang="x-default">__NAME__</display>
<value>__VAL__</value>
</value-definition>`

const run = () => {
  if (argv.in) {
    const valsJson = require(argv.in);
    let xml = '<value-definitions>';
    for (const el of valsJson) {
      let name = el;
      let val = (argv.prefix) ? argv.prefix + el  : '' + el;
      xml = xml.concat(defTemplate.replace('__NAME__', name).replace('__VAL__', val));
    }
    xml = xml.concat('</value-definitions>');
    console.log(xml);
    process.exit();
  } else {
    console.log('Useage --in= path to values json --prefix= value prefix');
    process.exit(1);
  }
};

run();
