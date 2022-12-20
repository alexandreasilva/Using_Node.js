const express = require('express')
const uuid = require('uuid')

const port = 3000
const server = express()
server.use(express.json())

const demand = []

const checkDemandId = (request, response, next) => {
    const { id } = request.params
    const index = demand.findIndex(amount => amount.id === id)
    if (index < 0) {
        return response.status(404).json({ wait: "No demand" })
    }

    request.orderIndex = index
    request.orderId = id

    next()
}

const requestMethodUrl = (request, response, next) => {
    console.log(request.method)
    console.log(request.url)

    next()
}

server.get('/demand', requestMethodUrl, (request, response) => {
    return response.json(demand)
})

server.get('/demand/:id', checkDemandId, requestMethodUrl, (request, response) => {
    const index = request.orderIndex
    const status = demand[index]
    return response.json(status)
})

server.post('/demand', requestMethodUrl, (request, response) => {
    const { clientName, order, price } = request.body
    const initiated = { id: uuid.v4(), clientName, order, price, status: "In preparation" }
    demand.push(initiated)
    return response.status(201).json(initiated)
})

server.listen(port, () => {
    console.log(`Server ${port} started`)
})

server.put('/demand/:id', checkDemandId, requestMethodUrl, (request, response) => {
    const { clientName, order, price, } = request.body
    const index = request.orderIndex
    const id = request.orderId
    const preparing = { id, clientName, order, price, status: "Order on the way" }
    if (index < 0) {
        return response.status(404).json({ wait: "Not found" })
    }

    demand[index] = preparing
    return response.json(preparing)
})

server.delete('/demand/:id', checkDemandId, requestMethodUrl, (request, response) => {
    const { id } = request.params
    const index = demand.findIndex(request => request.id === id)
    demand.splice(index, 1)
    return response.status(204), response.send({ wait: "Canceled order" })
})

server.patch('/demand/:id', checkDemandId, requestMethodUrl, (request, response) => {
    const index = request.orderIndex
    const statusUpdate = demand[index]
    statusUpdate.status = "Finished order"
    return response.json(statusUpdate)
})