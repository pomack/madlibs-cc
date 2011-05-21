#!/usr/bin/env python

import _mysql
import json

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

class Encoder(json.JSONEncoder):
  def default(self, obj):
    if hasattr(obj, 'to_json'):
      return obj.to_json()
    return obj

def main():
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
  s = json.dumps(d, cls=Encoder)
  print 'done dumping data to json string'
  fd = open('wiktionary.json', 'w')
  fd.write(s)
  fd.close()
  print 'done'

if __name__ == '__main__':
  import sys
  sys.exit(main())


