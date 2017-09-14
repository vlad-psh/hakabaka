require 'sinatra'
require 'sinatra/reloader'
require 'sinatra/activerecord'
require 'sinatra-snap'
require 'slim'

require 'rack-flash'
require 'yaml'
require 'redcloth'

require_relative './models.rb'
require_relative './helpers.rb'

also_reload './models.rb'
also_reload './helpers.rb'

paths index: '/',
    radicals: '/radicals',
    radical: '/radical/:id',
    kanjis: '/kanjis',
    kanji: '/kanji/:id',
    words: '/words',
    word: '/word/:id',
    learn: '/learn/:type/:id'

configure do
  puts '---> init <---'

  $config = YAML.load(File.open('config/application.yml'))

  use Rack::Session::Cookie,
#        key: 'fcs.app',
#        domain: '172.16.0.11',
#        path: '/',
#        expire_after: 2592000,
        secret: $config['secret']

  use Rack::Flash
end

helpers WakameHelpers

get :index do
  slim :index
end

get :radicals do
  @elements = Radical.all.order(level: :asc)
  slim :elements_list
end

get :radical do
  @radical = Radical.find(params[:id])
  slim :element
end

get :kanjis do
  @elements = Kanji.all.order(level: :asc)
  slim :elements_list
end

get :kanji do
  @kanji = Kanji.find(params[:id])
  slim :element
end

get :words do
  @elements = Word.all.order(level: :asc)
  slim :elements_list
end

get :word do
  @word = Word.find(params[:id])
  slim :element
end

post :learn do
  e = find_element(params[:type], params[:id])
  halt(503, 'Unknown element type') unless e
  e.learn!
end
