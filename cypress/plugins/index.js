/* eslint-disable no-undef */
/// <reference types="cypress" />
// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)

/**
 * @type {Cypress.PluginConfig}
 */
require('dotenv').config();
module.exports = (on, config) => {
	// `on` is used to hook into various events Cypress emits
	// `config` is the resolved Cypress config
	require('@cypress/code-coverage/task')(on, config);
	on('after:run', (results) => {
		// /!\ don't forget to return the Promise /!\
		return require('cypress-sonarqube-reporter/mergeReports')(results);
	});
	on(
		'file:preprocessor',
		require('@cypress/code-coverage/use-browserify-istanbul')
	);
	config.env.MAILGUN_API_KEY = process.env.MAILGUN_API_KEY;
	config.env.MAILGUN_DOMAIN = process.env.MAILGUN_DOMAIN;
	return config;
};
