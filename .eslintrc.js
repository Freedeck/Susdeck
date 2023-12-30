module.exports = {
  'env': {
    'browser': true,
    'commonjs': true,
    'es2021': true,
    'node': true,
  },
  'extends': 'google',
  'overrides': [
    {
      'env': {
        'node': true,
      },
      'files': [
        '.eslintrc.{js,cjs}',
      ],
      'parserOptions': {
        'sourceType': 'script',
      },
    },
  ],
  'parserOptions': {
    'ecmaVersion': 'latest',
    'sourceType': 'module',
    'ecmaFeatures': {
      'globalReturn': true,
    },
  },
  'rules': {
    'semi': ['error', 'always'],
    'max-len': ['error', {code: 170}],
  },
};

//   parserOpts: { allowReturnOutsideFunction: true }
