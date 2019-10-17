/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');

class TicketBlockContract extends Contract {

    async initLedger(ctx) {

    }

    async createEvent(ctx, name, date) {

        
        let response = {
            ok: true,
            responseTx: { msg: ''}
        }

        let event = {
            name,
            date,
            code: Date.now()
        }

        await ctx.stub.putState(`Event_${event.code}`, Buffer.from(JSON.stringify(event)))

        response.responseTx.msg = 'Evento creado';
        response.responseTx.event = event;

        return response
    }


    async getEvents(ctx) {

        let response = {
            ok: false,
            responseTx: { msg: ''}
        }

        const iterator = await ctx.stub.getStateByRange('Event_', '');
        const events = [];
        var res = await iterator.next();

        while (res.value != null){
            events.push(JSON.parse(res.value.value.toString('utf8')));  
            res = await iterator.next();
        }


        if(events[0] == null){
            response.responseTx.msg = 'No se encontrato eventos'
        }else{
            response.ok = true
            response.responseTx.msg = 'Consulta exitosa'
            response.responseTx.events = events
        }

        return response
  

        }

        async createTicket(ctx, eventCode ,ownerId, ownerName) {

            let response = {
                ok: false,
                responseTx: { msg: '' }
            }

            let eventAsBytes = await ctx.stub.getState(`Event_${eventCode}`);

            if  (!eventAsBytes || eventAsBytes.length === 0) {
                Response.responseTx.msg = 'El evento no se encuentra registrado'
                return response;
            }

            let event = JSON.parse(eventAsBytes.toString());



            let ticket = {
                code: Date.now(),
                ownerId,
                ownerName,
                eventName: event.name,
                eventCode,
                state: true

            }

            await ctx.stub.putState(`Ticket_${ticket.id}`, Buffer.from(JSON.stringify(ticket)));

            response.ok = true;
            response.responseTx.msg = 'Ticket Creado'
            response.responseTx.ticket = ticket;




            return response;

        }

        async queryTicket(ctx, id) {

            let response = {
                ok: false,
                responseTx: { msg: '' }
            }
            
            const ticketAsBytes = await ctx.stub.getState(`Ticket_${id}`);
            if (!ticketAsBytes || ticketAsBytes.length === 0) {
                response.responseTx.msg = 'Ticket no encontrado'
            } else {
                response.ok = true;
                 response.responseTx.msg = 'Consulta exitosa';
                 response.responseTx.ticket = (JSON.parse(ticketAsBytes.toString()));
            }

            return response;
        }


        async transfer(ctx, id, owner, newOwner) {

            let responseTx = {
                ok: false,
                response: {
                    msg: ''
                }
            }

            const ticketAsBytes = await ctx.stub.getState(`Ticket_${id}`);

            if (!ticketAsBytes || ticketAsBytes.length === 0) {
                responseTx.response.msg = 'El tiquete no existe'
                return responseTx
            } else {

                let ticket = JSON.parse(ticketAsBytes.toString());

                if ((ticket.state == vendido) && (!JSON.parse(ticket.resale))) {
                    responseTx.response.msg = 'El tiquete ya fue vendido y no se permite su reventa'
                    return responseTx
                }

                if (ticket.owner == owner) {
                    ticket.owner = newOwner;
                    ticket.state = 'vendido'
                    await ctx.stub.putState(id, Buffer.from(JSON.stringify(ticket)));

                    responseTx.ok = true
                    responseTx.response.msg = 'Transferencia exitosa'
                    responseTx.response.ticket = ticket
                    return responseTx
                } else {
                    responseTx.response.msg = 'Solo el propietario de un tiquete puede transferirlo'
                    return responseTx
                }

            }
        }


        async reedem(ctx, id) {

            let response = {
                ok: false,
                responseTx: {
                    msg: ''
                }
            }

            const ticketAsBytes = await ctx.stub.getState(`Ticket_${id}`);
            if (!ticketAsBytes || ticketAsBytes.length === 0) {

                response.ok = false;
                response.responseTx.msg = 'El tiquete no existe'
                return response;

            }

            let ticket = JSON.parse(ticketAsBytes.toString())

            if (!(JSON.parse(ticket.state))) {
                response.ok = false;
                response.responseTx.msg = 'El tiquete ya fue utilizado'
                
            } else {

                ticket.state = false;
                await ctx.stub.putState(`Ticket_${id}`, Buffer.from(JSON.stringify(ticket)));
                response.ok = true;
                response.responseTx.msg = 'Tiquete verificado';
                

            }
            return response;
        }

    }

module.exports = TicketBlockContract;
