import express from "express";
import { Server, createServer } from "http";
import { Server as Io } from "socket.io";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

class App {
  public app: express.Application;
  public server: Server;
  private socketIo: Io;

  constructor() {
    this.app = express();
    this.server = createServer(this.app);
    this.socketIo = new Io(this.server, {
      cors: {
        origin: ["http://localhost:3000", "https://chat-roomly.vercel.app"],
      },
    });

    this.socketIo.on("connection", async (socket) => {
      try {
        const messages = await prisma.message.findMany();

        socket.emit("messages", messages);
      } catch (error) {
        console.log(error);
      }

      socket.on("message", async (message) => {
        try {
          const savedMessage = await prisma.message.create({
            data: {
              name: message.name,
              image: message.image,
              message: message.message,
              isOwner: false,
            },
          });

          socket.broadcast.emit("message", savedMessage);
        } catch (error) {
          console.error("Erro ao salvar a mensagem:", error);
        }
      });
    });
  }
}

export default App;
