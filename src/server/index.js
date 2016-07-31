import path from 'path'
import express from 'express'
import React from 'react'
import { renderToString } from 'react-dom/server'
import { match, RouterContext } from 'react-router'
import Helmet from 'react-helmet'
import routes from '../shared/routes'

const app = express()
const PORT = process.env.PORT || 8080

app.use(express.static(path.join(__dirname, '/../../dist/public')))

function renderPage(appHtml, head) {
  return `
    <!DOCTYPE html>
    <html ${head.htmlAttributes.toString()}>
      <head>
        <meta charset="utf-8" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
        ${head.title.toString()}
        ${head.meta.toString()}
        ${head.link.toString()}
      </head>
      <body style="width:100%;">
        <div id="root">${appHtml}</div>
        <script src="/bundle.js"></script>
      </body>
    </html>
  `;
}

app.get('*', (req, res) => {
  match({ routes: routes, location: req.url }, (err, redirect, props) => {
    if (err) {
      res.status(500).send(err.message)
    } else if (redirect) {
      res.redirect(redirect.pathname + redirect.search)
    } else if (props) {
      const appHtml = renderToString(<RouterContext {...props} />)
      let head = Helmet.rewind();
      res.send(renderPage(appHtml, head))
    } else {
      res.status(404).send('Not Found')
    }
  })
})

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
})
