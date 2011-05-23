#!/usr/bin/env python
#
# Copyright 2007 Google Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
# 

from google.appengine.ext import db, webapp
from google.appengine.ext.webapp import util
try:
  import json
except:
  try:
    from simplejson import json
  except:
    from django.utils import simplejson as json

class Story(db.Model):
    text = db.TextProperty(required=True)


class StoreHandler(webapp.RequestHandler):
    def process(self, id):
        self.response.headers['Content-Type'] = 'application/json'
        self.response.headers['Access-Control-Allow-Credentials'] = 'true'
        self.response.headers['Access-Control-Allow-Methods'] = 'POST,PUT'
        self.response.headers['Access-Control-Allow-Origin'] = '*'
        self.response.headers['Access-Control-Max-Age'] = '60'
        id = id or self.request.get('id')
        output_json = False
        if self.request.headers['Content-Type'] == 'application/json':
            text = self.request.body
            output_json = True
        else:
            text = self.request.get('text')
        if not text:
            self.response.set_status(400)
            self.response.out.write('{"msg": "Must specify a body or a text field"}')
            return
        key = db.Key(id) if id else None
        story = Story(key=key, text=text)
        story.put()
        if output_json:
            self.response.set_status(200)
            self.response.out.write(json.dumps({'id': unicode(story.key()), 'text': story.text}))
        else:
            self.redirect(u'/view/' + unicode(story.key()) + '/')
    
    def post(self, id=None):
      self.process(id)
    
    def put(self, id=None):
        self.process(id)
    




class ViewHandler(webapp.RequestHandler):
    def process(self, id):
        id = id or self.request.GET.get('id')
        story = Story.get(db.Key(id))
        self.response.headers['Content-Type'] = 'application/json'
        self.response.headers['Access-Control-Allow-Credentials'] = 'true'
        self.response.headers['Access-Control-Allow-Methods'] = 'GET,HEAD'
        self.response.headers['Access-Control-Allow-Origin'] = '*'
        self.response.headers['Access-Control-Max-Age'] = '60'
        if story:
            self.response.set_status(200)
            self.response.out.write(story.text)
        else:
            self.response.set_status(404)
            self.response.out.write('{"msg": "Must specify a valid id"}')
  
    def get(self, id=None):
      self.process(id)
    
    def head(self, id=None):
        self.process(id)
    


class ListHandler(webapp.RequestHandler):
    def process(self):
        next = self.request.GET.get('next')
        q = Story.all(keys_only=True)
        if next:
          q.with_cursor(next)
        keys = q.fetch(limit=100)
        cursor = q.cursor() if len(keys) >= 100 else None
        self.response.headers['Content-Type'] = 'application/json'
        self.response.headers['Access-Control-Allow-Credentials'] = 'true'
        self.response.headers['Access-Control-Allow-Methods'] = 'GET,HEAD'
        self.response.headers['Access-Control-Allow-Origin'] = '*'
        self.response.headers['Access-Control-Max-Age'] = '60'
        self.response.set_status(200)
        self.response.out.write(json.dumps({'next': cursor, 'id': [unicode(key) for key in keys]}))
  
    def get(self):
      self.process()
    
    def head(self):
        self.process()
    



class MainHandler(webapp.RequestHandler):
    def get(self):
        self.response.set_status(200)
        self.response.headers['Content-Type'] = 'text/html'
        self.response.out.write("""<?xml version="1.0"?>
<!DOCTYPE html>
<html>
  <head>
    <title>General Storage</title>
  </head>
  <body>
    <h1>General Storage</h1>
    <form method="POST" action="/store/">
      <div>
        <label for="id">ID (can be left empty)</label>
        <input type="text" name="id"/>
      </div>
      <div>
        <label for="id">Raw Data</label>
        <textarea rows="40" cols="80" name="text" required="required"></textarea>
      </div>
      <input type="submit" value="Submit"/>
    </form>
  </body>
</html>
""")


def main():
    application = webapp.WSGIApplication([
        ('/', MainHandler),
        ('/list/', ListHandler),
        ('/view/', ViewHandler),
        (r'/view/(?P<id>\w+)/', ViewHandler),
        ('/store/', StoreHandler),
        (r'/store/(?P<id>\w+)/', StoreHandler),
    ],
                                         debug=True)
    util.run_wsgi_app(application)


if __name__ == '__main__':
    main()

