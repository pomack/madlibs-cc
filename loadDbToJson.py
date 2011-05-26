#!/usr/bin/env python


from __future__ import with_statement
import _mysql
import json
import urllib2
import optparse

def to_unicode(s):
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
    


class StoredWord(object):
  def __init__(self, row=None):
    if not row:
      row = [None, None, None, None, None, None, None, None, None, None, None]
    self.language = to_unicode(row[0])
    self.word = to_unicode(row[1]) #
    self.part_of_speech = to_unicode(row[2]) #
    self.def_long = to_unicode(row[3])
    self.overhang = to_unicode(row[4])
    self.pos_original = to_unicode(row[5])
    self.tags = to_unicode(row[6]) #
    self.def_display = to_unicode(row[7]) #
    self.frequency = row[8] or 0

class Word(object):
  def __init__(self, language, word):
    self.language = language
    self.word = word
    self.parts_of_speech = {}
    self.tags = set()
    self.frequency = 0
  
  def __hash__(self):
    return hash(self.word)
  
  def __eq__(self, other):
    return other is not None and hasattr(other, 'word') and self.word == other.word
  
  def __cmp__(self, other):
    if other is not None and hasattr(other, 'word'):
      return cmp(self.word, other.word)
    return -1
  
  def addWord(self, word):
    if word.part_of_speech not in self.parts_of_speech:
      self.parts_of_speech[word.part_of_speech] = []
    self.parts_of_speech[word.part_of_speech].append(word.def_display)
    tags = set()
    if '}}' in word.def_long:
      arr = word.def_long.split('}}')
      for elem in arr:
        if '{{' not in elem:
          continue
        tags.add(elem.split('{{')[1].strip())
    if ']]' in word.def_long:
      arr = word.def_long.split(']]')
      for elem in arr:
        if '[[' not in elem:
          continue
        tags.add(elem.split('[[')[1].strip())
    if tags:
      self.tags |= tags
    self.frequency = max(self.frequency, word.frequency)
  
  def to_json(self):
    return {
      'language' : self.language,
      'word' : self.word,
      'parts_of_speech' : self.parts_of_speech,
      'tags' : list(self.tags),
      'frequency' : self.frequency,
    }
  
  @classmethod
  def from_json(cls, dct):
    w = Word(dct.get('language'), dct.get('word'))
    w.tags = set(dct.get('tags', []))
    w.frequency = dct.get('frequency', 0) or 0
    w.parts_of_speech = dct.get('parts_of_speech')
    return w

class Encoder(json.JSONEncoder):
  def default(self, obj):
    if hasattr(obj, 'to_json'):
      return obj.to_json()
    return obj

def json_object_hook(dct):
  if 'language' in dct and 'word' in dct:
    return Word.from_json(dct)
  return dct

def retrieve_from_db():
  db = _mysql.connect(host='192.168.1.120', user='aalok', passwd='shah', port=3306, db='wiktionary')
  db.query('SELECT * FROM wiktionary_en')
  r = db.use_result()
  d = {}
  i = 0
  print 'loading data'
  while True:
    row = r.fetch_row()
    if not row:
      break
    row = row[0]
    sw = StoredWord(row)
    lw = sw.word.lower()
    if lw not in d:
      d[lw] = Word(sw.language, sw.word)
    d[lw].addWord(sw)
    i += 1
    if i % 100 == 0:
      print 'Finished loading %d rows with %d words' % (i, len(d))
  print 'done loading data'
  fd = open('wiktionary2.json', 'w')
  fd.write('[\n')
  for k,v in sorted(d.iteritems()):
    fd.write(v, cls=Encoder)
    fd.write(',\n')
  fd.write('{}\n')
  fd.write(']\n')
  fd.close()
  print 'done'
  return 0

def load_dictionary_to_appengine(url=None, start_at_offset=None):
  upload = []
  url = url or 'http://madlibs-cc.appspot.com/dictionary/store/'
  counter = 0
  print 'loading wiktionary2.json'
  with open('wiktionary2.json') as fd:
    for line in fd:
      if not line.startswith('{'):
        continue
      if start_at_offset and counter < start_at_offset:
        counter += 1
        continue
      de = json.loads(line.strip()[0:line.rindex('}')+1])
      upload.append(de)
      if len(upload) >= 1000:
        print 'uploading %d to %d, last word: "%s"' % (counter, (len(upload) + counter), de.get('word'))
        urllib2.urlopen(url, json.dumps(upload))
        counter += len(upload)
        print 'done uploading %d through "%s"' % (counter, de.get('word'))
        upload = []
  if upload:
    print 'uploading %d to %d through "%s"' % (counter, (len(upload) + counter), upload[-1].get('word'))
    urllib2.urlopen(url, json.dumps(upload))
    counter += len(upload)
    print 'done uploading %d through "%s"' % (counter,upload[-1].get('word'))
  return 0


def load_lexicon_to_appengine(url=None, start_at_offset=None):
  upload = []
  url = url or 'http://madlibs-cc.appspot.com/lexicon/store/'
  counter = 0
  print 'loading lexicon2.json'
  with open('lexicon2.json') as fd:
    for line in fd:
      if not line.startswith('{'):
        continue
      if start_at_offset and counter < start_at_offset:
        counter += 1
        continue
      de = json.loads(line.strip()[0:line.rindex('}')+1])
      upload.append(de)
      if len(upload) >= 1000:
        print 'uploading %d to %d, last word: "%s"' % (counter, (len(upload) + counter), de.get('word'))
        urllib2.urlopen(url, json.dumps(upload))
        counter += len(upload)
        print 'done uploading %d through "%s"' % (counter, de.get('word'))
        upload = []
  if upload:
    print 'uploading %d to %d through "%s"' % (counter, (len(upload) + counter), upload[-1].get('word'))
    urllib2.urlopen(url, json.dumps(upload))
    counter += len(upload)
    print 'done uploading %d through "%s"' % (counter,upload[-1].get('word'))
  return 0

def get_parser():
  parser = optparse.OptionParser()
  parser.add_option('-r', '--retrieve', dest='retrieve_from_mysql', action='store_true', help='Retrieve from MySQL and dump to JSON file')
  parser.add_option('-l', '--load_dictionary', dest='load_dictionary', action='store_true', help='Load Dictionary to AppEngine')
  parser.add_option('-L', '--load_lexicon', dest='load_lexicon', action='store_true', help='Load Lexicon to AppEngine')
  parser.add_option('-o', '--offset', dest='offset', type='int', help='Start at offset')
  parser.add_option('-u', '--url', dest='url', help='URL to upload to')
  return parser
  
  
def main(argv):
  parser = get_parser()
  args, options = parser.parse_args(argv)
  if args.retrieve_from_mysql and args.load_dictionary:
    parser.parse_error('Cannot specify both -r and -l')
    return 1
  if args.retrieve_from_mysql:
    return retrieve_from_db()
  if args.load_dictionary:
    return load_dictionary_to_appengine(args.url or None, args.offset or None)
  if args.load_lexicon:
    return load_lexicon_to_appengine(args.url or None, args.offset or None)
  parser.parse_error('Must specify either -r or -l')
  return 1

if __name__ == '__main__':
  import sys
  sys.exit(main(sys.argv))


