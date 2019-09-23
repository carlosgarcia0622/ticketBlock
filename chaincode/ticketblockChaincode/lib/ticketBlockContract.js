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

    async queryTicket(ctx, id){
        const ticketAsBytes = await ctx.stub.getState(id);
        if (!ticketAsBytes || ticketAsBytes.length === 0) {
            return null
        }else{
            return (JSON.parse(ticketAsBytes.toString()))
        }  
    }


    async transfer(ctx, id, owner, newOwner){

        let responseTx = {
            ok: false,
            response:{
                msg:''
            }
        }

        const ticketAsBytes = await ctx.stub.getState(id);

        if (!ticketAsBytes || ticketAsBytes.length === 0) {
            responseTx.response.msg = 'El tiquete no existe'
            return responseTx
        }else{
            let ticket = JSON.parse(ticketAsBytes.toString());
            if(ticket.owner == owner){
                ticket.owner = newOwner;
                await ctx.stub.putState(id, Buffer.from(JSON.stringify(ticket)));

                responseTx.ok = true
                responseTx.response.msg = 'Transferencia exitosa'
                responseTx.response.ticket = ticket 
                return responseTx
            }else{
                responseTx.response.msg = 'Solo el propietario de un tiquete puede transferirlo'
                return responseTx
            }
            
        } 
    }


    async reedem(ctx, id){

        let responseTx= {
            ok: false,
            response: {
                msg: '.'
            }
        }

        const ticketAsBytes = await ctx.stub.getState(id);
        if (!ticketAsBytes || ticketAsBytes.length === 0) {

            responseTx.ok = false;
            responseTx.response.msg = 'El tiquete no existe'
            return responseTx;

        }

            let ticket = JSON.parse(ticketAsBytes.toString())

            if( (ticket.state == 'verificado')){
                responseTx.ok = false;
                responseTx.response.msg = 'El tiquete ya fue utilizado'
                return responseTx;
            }else{

                ticket.state = 'verificado';
                await ctx.stub.putState(id, Buffer.from(JSON.stringify(ticket)));
                responseTx.ok = true;
                responseTx.response.msg = 'Verificación de tiquete exitosa';
                return responseTx

            }
        }

}

module.exports = TicketBlockContract;
