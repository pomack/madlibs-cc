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
import os.path
import decimal
import random
try:
  import json
except:
  try:
    from simplejson import json
  except:
    from django.utils import simplejson as json

ALPHABET = 'abcdefghijklmnopqrstuvwxyz'

def to_unicode(s):
    if s is None:
        return ''
    try:
        return unicode(s)
    except:
        pass
    try:
        return unicode(s, encoding='windows-1252')
    except:
        pass
    try:
        return unicode(s, encoding='iso-8859-1')
    except:
        pass
    return unicode(s, encoding='latin-1')


class Story(db.Model):
    text = db.TextProperty(required=True)
    
    @classmethod
    def make_key(cls, id):
        return db.Key.from_path('Story', int(id))
    



class Word(db.Model):
    text = db.StringProperty(required=True)
    sort_text = db.StringProperty(required=True)
    categories = db.StringListProperty(required=True)
    
    @classmethod
    def make_key(cls, key_name):
        return db.Key.from_path('Word', key_name)
    
    @classmethod
    def from_json(cls, k=None, arr=None):
        if arr is None and k is None:
            return None
        if arr is None and k is not None:
            if type(k) is dict:
                words = []
                for key, value in k.iteritems():
                    arr = [to_unicode(o) for o in value]
                    key = to_unicode(key)
                    words.append(Word(key=cls.make_key(key), text=key, sort_text=key.lower(), categories=arr))
                return words
            k = to_unicode(k)
            if k:
                return Word(key=cls.make_key(k), text=k, sort_text=k.lower(), categories=[])
            return None
        k = to_unicode(k)
        if not hasattr(arr, '__iter__'):
            arr = [arr]
        arr = [to_unicode(o) for o in arr]
        if not k or not arr:
            return None
        return Word(key=cls.make_key(k), text=k, sort_text=k.lower(), categories=arr)
    


class DictionaryEntry(db.Model):
    language = db.StringProperty(required=True)
    word = db.StringProperty(required=True)
    sort_word = db.StringProperty(required=True)
    parts_of_speech = db.StringListProperty(required=True)
    definitions = db.ListProperty(db.Text, required=True, indexed=False)
    tags = db.StringListProperty(required=True)
    frequency = db.IntegerProperty(default=0)
    
    @classmethod
    def key_from_language_and_word(cls, language, word):
        return db.Key.from_path('DictionaryEntry', to_unicode(language).lower() + '|' + to_unicode(word).lower())
    
    @classmethod
    def from_json(cls, obj):
        if obj is None:
            return None
        if type(obj) is dict:
            if 'language' in obj and 'word' in obj:
                language = to_unicode(obj['language'])
                word = to_unicode(obj['word'])
                parts_of_speech = obj.get('parts_of_speech') or {}
                pos = []
                definitions = []
                tags = obj.get('tags') or []
                tags = [to_unicode(o).lower() for o in tags]
                frequency = obj.get('frequency') or 0
                word_lower = word.lower()
                for k,v in parts_of_speech.iteritems():
                    k = to_unicode(k).lower()
                    if hasattr(v, '__iter__'):
                        for adef in v:
                            pos.append(k)
                            definitions.append(db.Text(to_unicode(adef).strip()))
                    else:
                        pos.append(k)
                        definitions.append(db.Text(to_unicode(v).strip()))
                key = DictionaryEntry.key_from_language_and_word(language, word_lower)
                return DictionaryEntry(
                    key=key,
                    language=language,
                    word=word,
                    sort_word=word_lower,
                    parts_of_speech=pos,
                    definitions=definitions,
                    tags=tags,
                    frequency=int(frequency or 0),
                )
        if hasattr(obj, '__iter__'):
            return [cls.from_json(o) for o in obj]
        return None
    
    def to_json(self):
        pos = {}
        for i in xrange(0, len(self.parts_of_speech)):
            p = self.parts_of_speech[i]
            v = to_unicode(self.definitions[i])
            if p not in pos:
                pos[p] = []
            pos[p].append(v)
        d = {
            'language' : self.language,
            'word' : self.word,
            'parts_of_speech' : pos,
            'tags' : self.tags,
            'frequency' : self.frequency,
        }
        return d
    



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
    


class FindHandler(webapp.RequestHandler):
    def process(self):
        next = self.request.GET.get('next')
        text = self.request.GET.get('text')
        category = self.request.GET.get('category')
        if text:
            ltext = text.lower()
            q = Word.all().filter('text =', text)
            if category:
                q.filter('categories =', category.upper())
            word = q.get()
            results = [word] if word else []
            if not results:
                q = Word.all().filter('sort_text =', text)
                if category:
                    q.filter('categories =', category.upper())
                word = q.get()
                results = [word] if word else []
            if not results:
                ntext = ltext[0:-1] + chr(ord(ltext[-1]))
                q = Word.all().order('sort_text').filter('sort_text >=', ltext)
                if category:
                    q.filter('categories =', category.upper())
                if next:
                    q.with_cursor(next)
                for o in q.fetch(100):
                    if not o.sort_text.startswith(ltext):
                        break
                    results.append(o)
        elif category:
            terms = [random.choice(ALPHABET) + random.choice(ALPHABET) + random.choice(ALPHABET) for x in xrange(0, 10)]
            words = [Word.all().order('sort_text').filter('categories =', category.upper()).filter('sort_text >= ', term).get() for term in terms]
            results = [word for word in words if word]
        else:
            results = []
        results = [{'text' : o.text, 'sort_text' : o.sort_text, 'categories' : o.categories} for o in results]
        cursor = q.cursor() if text and len(results) > 50 else None
        self.response.headers['Content-Type'] = 'application/json'
        self.response.headers['Access-Control-Allow-Credentials'] = 'true'
        self.response.headers['Access-Control-Allow-Methods'] = 'GET,HEAD'
        self.response.headers['Access-Control-Allow-Origin'] = '*'
        self.response.headers['Access-Control-Max-Age'] = '60'
        self.response.set_status(200)
        self.response.out.write(json.dumps({'next': cursor, 'words': results, 'category' : category, 'text' : text}))
    
    def get(self):
        self.process()
    
    def head(self):
        self.process()
    

class StoreLexiconHandler(webapp.RequestHandler):
    def process(self):
        an_arr = json.loads(self.request.body)
        arr = []
        for d in an_arr:
            k = d.get('word')
            v = d.get('part_of_speech')
            if not k:
                continue
            arr.append(Word(key=Word.make_key(k), text=k, sort_text=k.lower(), categories=v))
        db.put(arr)
        self.response.headers['Content-Type'] = 'application/json'
        self.response.headers['Access-Control-Allow-Credentials'] = 'true'
        self.response.headers['Access-Control-Allow-Methods'] = 'GET,HEAD'
        self.response.headers['Access-Control-Allow-Origin'] = '*'
        self.response.headers['Access-Control-Max-Age'] = '60'
        self.response.set_status(200)
        self.response.out.write(json.dumps({'next': k, 'stored': len(arr)}))
    
    def post(self):
        self.process()
    



class LoadLexiconHandler(webapp.RequestHandler):
    def process(self):
        fd = open('lexicon.json')
        try:
            d = json.loads(fd.read())
        finally:
            fd.close()
        arr = []
        try:
            limit = int(self.request.GET.get('limit') or 10000)
        except:
            limit = 10000
        next = self.request.GET.get('next') or ''
        break_on_next = False
        for k,v in sorted(d.iteritems()):
            if not k and not v:
                continue
            if not k or not v:
                raise ValueError('Expected a key but got "%s" => "%s"' % (k, v))
            if next and k < next:
                continue
            if break_on_next:
                break
            arr.append(Word(key=Word.make_key(k), text=k, sort_text=k.lower(), categories=v))
            if limit and len(arr) > limit:
                db.put(arr)
                break_on_next = True
        else:
            k = None
        #arr = [Word(text=k, categories=v) for k,v in d.iteritems() if k and v]
        #db.put(arr)
        self.response.headers['Content-Type'] = 'application/json'
        self.response.headers['Access-Control-Allow-Credentials'] = 'true'
        self.response.headers['Access-Control-Allow-Methods'] = 'GET,HEAD'
        self.response.headers['Access-Control-Allow-Origin'] = '*'
        self.response.headers['Access-Control-Max-Age'] = '60'
        self.response.set_status(200)
        self.response.out.write(json.dumps({'next': k, 'stored': len(arr)}))
    
    def get(self):
        self.process()
    
    def head(self):
        self.process()
    


#
class FindDictionaryEntryByTypeAndTagHandler(webapp.RequestHandler):
    def process(self):
        pos = self.request.GET.get('part_of_speech', '').split('|')
        tags = self.request.GET.get('tag', '').split('|')
        limit = self.request.GET.get('limit')
        pos = [to_unicode(o).strip().lower() for o in pos if o.strip()]
        tags = [to_unicode(o).strip() for o in tags if o.strip()]
        if not pos and not tags:
            output = []
            executed = False
        else:
            q = DictionaryEntry.all().order('-frequency').order('sort_word')
            if pos:
                if len(pos) == 1 and pos[0]:
                    q.filter('parts_of_speech =', pos[0])
                elif len(pos) > 1:
                    q.filter('parts_of_speech IN', pos)
            if tags:
                if len(tags) == 1 and tags[0]:
                    q.filter('tags =', tags[0])
                elif len(tags) > 1:
                    q.filter('tags IN', tags)
            if limit:
                try:
                    limit = min(int(limit, 10), 100)
                    if limit <= 0:
                        limit = 100
                except:
                    limit = 100
            else:
                limit = 100
            rows = q.fetch(limit=limit)
            output = [o.to_json() for o in rows if o is not None]
            executed = True
        self.response.headers['Content-Type'] = 'application/json'
        self.response.headers['Access-Control-Allow-Credentials'] = 'true'
        self.response.headers['Access-Control-Allow-Methods'] = 'GET,HEAD'
        self.response.headers['Access-Control-Allow-Origin'] = '*'
        self.response.headers['Access-Control-Max-Age'] = '60'
        self.response.set_status(200)
        self.response.out.write(json.dumps(output))
    
    def get(self):
        self.process()
    
    def head(self):
        self.head()
    


#
class FindDictionaryEntryByWordHandler(webapp.RequestHandler):
    def process(self):
        words = self.request.GET.get('word', '').split('|')
        language = self.request.GET.get('language', 'English') or 'English'
        if not words:
            output = []
        else:
            keys = [DictionaryEntry.key_from_language_and_word(language, o) for o in words if o is not None]
            rows = DictionaryEntry.get(keys)
            output = [o.to_json() for o in rows if o is not None]
        self.response.headers['Content-Type'] = 'application/json'
        self.response.headers['Access-Control-Allow-Credentials'] = 'true'
        self.response.headers['Access-Control-Allow-Methods'] = 'GET,HEAD'
        self.response.headers['Access-Control-Allow-Origin'] = '*'
        self.response.headers['Access-Control-Max-Age'] = '60'
        self.response.set_status(200)
        self.response.out.write(json.dumps(output))
    
    def get(self):
        self.process()
    
    def head(self):
        self.head()
    


#
class StoreDictionaryHandler(webapp.RequestHandler):
    def process(self):
        arr = json.loads(self.request.body)
        if not arr:
            arr = []
        if not hasattr(arr, '__iter__'):
            arr = [arr]
        entries = [DictionaryEntry.from_json(o) for o in arr]
        if entries:
            db.put(entries)
        self.response.headers['Content-Type'] = 'application/json'
        self.response.headers['Access-Control-Allow-Credentials'] = 'true'
        self.response.headers['Access-Control-Allow-Methods'] = 'POST'
        self.response.headers['Access-Control-Allow-Origin'] = '*'
        self.response.headers['Access-Control-Max-Age'] = '60'
        self.response.set_status(200)
        self.response.out.write(json.dumps({'stored': len(entries)}))
    
    def post(self):
        self.process()


#

class MainHandler(webapp.RequestHandler):
    index_html_value = None
    def process(self):
        self.redirect(u'/static/index.html')
    
    def get(self):
        self.process()
    
    def post(self):
        self.process()
    
    def head(self):
        self.process()
    
    

class StorageHandler(webapp.RequestHandler):
    def process(self):
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
    
    def get(self):
        self.process()
    
    def head(self):
        self.process()
    



def main():
    application = webapp.WSGIApplication([
        ('/', MainHandler),
        ('/storage/', StorageHandler),
        ('/list/', ListHandler),
        ('/view/', ViewHandler),
        (r'/view/(?P<id>\w+)/', ViewHandler),
        ('/store/', StoreHandler),
        (r'/store/(?P<id>\w+)/', StoreHandler),
        ('/load/', LoadLexiconHandler),
        ('/lexicon/store/', StoreLexiconHandler),
        ('/find/', FindHandler),
        ('/dictionary/search/', FindDictionaryEntryByTypeAndTagHandler),
        ('/dictionary/define/', FindDictionaryEntryByWordHandler),
        ('/dictionary/store/', StoreDictionaryHandler),
    ],
                                         debug=True)
    util.run_wsgi_app(application)


if __name__ == '__main__':
    main()
