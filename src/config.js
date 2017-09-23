/**
 * @author Vladyslav Zaichuk <xinonghost@gmail.com>
 */

'use strict'

// Main P2P network port.
exports.p2pPort = process.env.P2P_PORT || '3001';

// RPC port.
exports.rpcPort = process.env.HTTP_PORT || '3002';

// Initial peers to start with.
exports.initialPeers = process.env.PEERS ? process.env.PEERS.split(',') : ['138.197.73.48'];

// Peers of network.
exports.peers = [];