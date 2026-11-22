// Same i18next instance that _layout.js configures; importing it here keeps the
// translation resources loaded for the stack without re-initialising i18next.
import './Services/i18next';
import React from 'react';
import HomePage from './screens/HomePage';

export default function Home() {
  return <HomePage />;
}