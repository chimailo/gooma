'use strict';

const config = require('config');
const jwt = require('jsonwebtoken');

// Generate token from the user's id
function getToken({ id, username }) {
  const payload = {
    user: {
      id,
      username
    }
  };

  const token = jwt.sign(payload, config.get('jwtSecret'), {
    expiresIn: 3600
  });

  return token;
}

function genRandomString(len) {
  return [...Array(len)]
    .map(i => (~~(Math.random() * 36)).toString(36))
    .join('');
}

function slugify(string) {
  const a =
    'àáäâãåăæąçćčđďèéěėëêęğǵḧìíïîįłḿǹńňñòóöôœøṕŕřßşśšșťțùúüûǘůűūųẃẍÿýźžż·/_,:;';
  const b =
    'aaaaaaaaacccddeeeeeeegghiiiiilmnnnnooooooprrsssssttuuuuuuuuuwxyyzzz------';
  const p = new RegExp(a.split('').join('|'), 'g');

  return string
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(p, c => b.charAt(a.indexOf(c))) // Replace special characters
    .replace(/&/g, '-and-') // Replace & with 'and'
    .replace(/[^\w\-]+/g, '') // Remove all non-word characters
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, ''); // Trim - from end of text
}

module.exports = {
  getToken,
  slugify,
  genRandomString
};
