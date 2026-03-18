import dotenv from "dotenv/config"
import app from "./app.js"
import connectDB from "./config/db.js"
import "./workers/itemWorker.js"




const PORT = process.env.PORT || 3000
connectDB()


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})

