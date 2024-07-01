#!/usr/bin/env node
import { PrismaClient } from '@prisma/client';
import bcrypt from "bcrypt"

import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

const prisma = new PrismaClient();

async function main() {
    try {
        for (const userData of [
            { name: 'John Doe', number: '1234567890', email: 'a@example.com' },
            { name: 'Jane Doe', number: '9876543210', email: 'b@example.com' },
            { name: 'Bob Smith', number: '2111111111', email: 'c@example.com' },
            { name: 'Alice Johnson', number: '2111111115', email: 'd@example.com' },
            { name: 'Mike Brown', number: '2111156111', email: 'e@example.com' },
        ]) {
            const user = await prisma.users.createMany({ data: userData });
        }

        const users = await prisma.users.findMany();

        // Create credentials
        for (const user of users) {
            const token = jwt.sign({
                number: user.number
            }, JWT_SECRET);
            const salt = 10;
            const hash = await bcrypt.hash('password123', salt);
            await prisma.credentials.create({
                data: {
                    userId: user.id,
                    token: token,
                    hash: hash
                }
            });
        }

        // Create contacts
        await prisma.contacts.createMany({
            data: [
                { userId: users[0].id, number: '0987654321', name: 'Alice Johnson' },
                { userId: users[1].id, number: '5551234567', name: 'Mike Brown' },
                { userId: users[2].id, number: '1234567890', name: 'John Doe' },
                { userId: users[3].id, number: '5559876543', name: 'Alice Johnson' },
                { userId: users[4].id, number: '1234567890', name: 'John Doe' },
                { userId: users[Math.floor(Math.random() + 4)].id, number: '0987654321', name: 'Jane Doe' },
                { userId: users[Math.floor(Math.random() + 4)].id, number: '5551234567', name: 'John Doe' },
                { userId: users[Math.floor(Math.random() + 4)].id, number: '5555551234', name: 'Bob Smith' },
                { userId: users[Math.floor(Math.random() + 4)].id, number: '5559876543', name: 'Alice Johnson' },
                { userId: users[Math.floor(Math.random() + 4)].id, number: '1234567890', name: 'John Doe' },
            ],
        });

        // GlobalDB

        const contacts = await prisma.contacts.findMany();

        const uniqueNumbers = new Set();

        contacts.map((contact) => {
            const number = contact.number;
            uniqueNumbers.add(number);
        });

        const promises = [];
        uniqueNumbers.forEach((number) => {
            promises.push(
                prisma.globalDB.create({
                    data: {
                        isRegistered: Math.random() < 0.5,
                        number: number,
                    },
                }),
            );
        });

        await Promise.all(promises);

        const globalData = await prisma.globalDB.findMany({});

        // console.log('globalData:', globalData);
        // console.log('users:', users);

        for (let i = 0; i < users.length; i++) {
            const userData = users[i];
            const globalDataElement = globalData[i];

            if (globalDataElement && globalDataElement.number === userData.number) {
                // console.log(`Updating globalDB record for number ${userData.number}`);
                await prisma.globalDB.update({
                    where: {
                        number: userData.number
                    },
                    data: {
                        registeredUserId: userData.id
                    }
                });
                // console.log(`Updated globalDB record for number ${userData.number}`);
            }
        }


        // Create names
        await prisma.name.createMany({
            data: [
                { name: 'john doe', globalDBId: globalData[0].id },
                { name: 'jane doe', globalDBId: globalData[1].id },
                { name: 'bob smith', globalDBId: globalData[2].id },
                { name: 'alice johnson', globalDBId: globalData[3].id },
                { name: 'mike brown', globalDBId: globalData[4].id },
            ],
        });

        // Create spam reports
        await prisma.spamReport.createMany({
            data: [
                { globalDBId: globalData[0].id, reportedById: users[0].id },
                { globalDBId: globalData[1].id, reportedById: users[1].id },
                { globalDBId: globalData[2].id, reportedById: users[2].id },
                { globalDBId: globalData[3].id, reportedById: users[3].id },
                { globalDBId: globalData[4].id, reportedById: users[4].id },
            ],
        });
    } catch (error) {
        console.error(error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();