/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');

class TicketBlockContract extends Contract {

    async initLedger(ctx) {

    }

    async createTickets(ctx, id, expedition, expiration, state, owner, price, resale, issuer, event, data, amount) {

        let tickets = [];
        let ticketBase;

        for (let i = 0; i < amount; i++) {

            ticketBase = {
                id: id + i,
                expedition,
                expiration,
                state,
                owner,
                price,
                resale,
                issuer,
                event,
                data
            }

            await ctx.stub.putState(id + i, Buffer.from(JSON.stringify(ticketBase)));
            tickets.push(ticketBase);
            console.log(i+'\n')

        }

        return tickets;

    }

}

module.exports = TicketBlockContract;
