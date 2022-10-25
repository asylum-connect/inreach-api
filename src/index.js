import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import morgan from 'morgan';

// Connect the database client
import './db';
import {baseRouter, versionOneRouter} from './routes';

const server = express();
const port = process.env.PORT || 8080;

// Logging for dev/test
if (process.env.NODE_ENV === 'development') {
	console.log(`Dev environment: Enable extra logging.`);
	server.use(morgan('dev'));
}

// Set up cors
server.use(cors());

// Accept JSON
server.use(bodyParser.json());

// Set up routes
server.use(baseRouter);
server.use('/v1', versionOneRouter);

// Start server
server.listen(port, () =>
	// eslint-disable-next-line
	console.log(`Listening at: http://localhost:${port}`)
);

export default server;
