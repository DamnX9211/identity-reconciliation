import "dotenv/config";
import app from "./app";


const PORT = process.env.PORT || 3000;
console.log(process.env.DATABASE_URL);

app.listen(PORT, () => {
    console.log(`Server running on post ${PORT}`)
});