import { FlatCompat } from '@eslint/eslintrc'
import eslintConfigPrettier from 'eslint-config-prettier'

const compat = new FlatCompat()

export default [
  ...compat.extends('eslint-config-standard'),
  eslintConfigPrettier
]
