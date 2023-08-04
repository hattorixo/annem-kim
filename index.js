const Discord = require('discord.js');
const axios = require('axios');
const fs = require('fs');
const client = new Discord.Client();

const GIPHY_API_KEY = 'DEGISTIR'; // Giphy API anahtarınızla değiştirin

client.once('ready', () => {
  console.log('Bot aktif!');
});

let names = {};
try {
  const data = fs.readFileSync('./names.json');
  names = JSON.parse(data);
} catch (err) {
  console.error('JSON dosyasından isimler okunurken bir hata oluştu:', err.message);
}

function capitalizeName(name) {
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
}

function isValidURL(url) {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
}

function getFullName(args) {
  return args.map(capitalizeName).join(' ');
}

function getFullNameAndImage(args) {
  const fullName = args.slice(0, args.length - 1).map(capitalizeName).join(' ');
  const image = args[args.length - 1];
  return { fullName, image };
}

function getFullName(args) {
  return args.map(capitalizeName).join(' ');
}

client.on('message', async (message) => {
  const content = message.content.toLowerCase();
  // Yönetici rol ID'si
  const desiredRoleID = 'DEGISTIR';
  const hasDesiredRole = message.member.roles.cache.has(desiredRoleID);
  const isBotOwner = message.author.id === message.guild.ownerID;
  if (content.startsWith('anneekle') && hasDesiredRole) {
    const args = content.slice(9).trim().split(' ');
    if (args.length < 1) return message.channel.send(':x: Geçersiz komut kullanımı. anneekle İsim [Soyisim] [ResimLink] şeklinde girin.');
    const firstName = capitalizeName(args[0]);
    let lastName = '';
    let image = '';
    if (args.length >= 2) {
      if (isValidURL(args[args.length - 1])) {
        image = args[args.length - 1];
        lastName = args.slice(1, args.length - 1).map(capitalizeName).join(' ');
      } else {
        lastName = capitalizeName(args.slice(1).join(' '));
      }
    }
    const fullName = lastName ? `${firstName} ${lastName}` : firstName;
    if (names.kadin.find((item) => item.name === fullName)) {
      return message.channel.send(`:x: "${fullName}" anne ismi zaten listede mevcut.`);
    }
    names.kadin.push({ name: fullName, image });
    fs.writeFileSync('./names.json', JSON.stringify(names, null, 2));
    message.channel.send(`:female_sign: :white_check_mark: ${fullName} anne ismi listeye eklendi.`);
  } else if (content.startsWith('babaekle') && hasDesiredRole) {
    const args = content.slice(9).trim().split(' ');
    if (args.length < 1) return message.channel.send(':x: Geçersiz komut kullanımı. "babaekle İsim [Soyisim] [ResimLink] şeklinde girin.');
    const firstName = capitalizeName(args[0]);
    let lastName = '';
    let image = '';
    if (args.length >= 2) {
      if (isValidURL(args[args.length - 1])) {
        image = args[args.length - 1];
        lastName = args.slice(1, args.length - 1).map(capitalizeName).join(' ');
      } else {
        lastName = capitalizeName(args.slice(1).join(' '));
      }
    }
    const fullName = lastName ? `${firstName} ${lastName}` : firstName;
    if (names.erkek.find((item) => item.name === fullName)) {
      return message.channel.send(`:x: "${fullName}" baba ismi zaten listede mevcut.`);
    }
    names.erkek.push({ name: fullName, image });
    fs.writeFileSync('./names.json', JSON.stringify(names, null, 2));
    message.channel.send(`:male_sign: :white_check_mark: "${fullName}" baba ismi listeye eklendi.`);
  } else if (content.includes('annem kim')) {
    const rastgeleIndex = Math.floor(Math.random() * names.kadin.length);
    const rastgeleIsim = names.kadin[rastgeleIndex];
    try {
      const giphyResponse = await axios.get(`http://api.giphy.com/v1/gifs/search`, {
        params: {
          q: rastgeleIsim.name,
          api_key: GIPHY_API_KEY,
          limit: 1,
        },
      });
      const gifUrl = giphyResponse.data.data[0]?.images?.downsized_medium?.url || 'https://media.giphy.com/media/3o7TKs5p6Yxd7hqt8E/giphy.gif';
      const embed = new Discord.MessageEmbed()
        .setColor('#FF00FF')
        .setTitle('Senin annen ' + rastgeleIsim.name + '!')
        .setImage(rastgeleIsim.image || gifUrl);
      message.channel.send(embed);
    } catch (error) {
      console.error('Giphy verileri alınırken bir hata oluştu:', error.message);
    }
  } else if (content.includes('babam kim')) {
    const rastgeleIndex = Math.floor(Math.random() * names.erkek.length);
    const rastgeleIsim = names.erkek[rastgeleIndex];
    try {
      const giphyResponse = await axios.get(`http://api.giphy.com/v1/gifs/search`, {
        params: {
          q: rastgeleIsim.name,
          api_key: GIPHY_API_KEY,
          limit: 1,
        },
      });
      const gifUrl = giphyResponse.data.data[0]?.images?.downsized_medium?.url || 'https://media.giphy.com/media/3o7TKs5p6Yxd7hqt8E/giphy.gif';
      const embed = new Discord.MessageEmbed()
        .setColor('#0000FF')
        .setTitle('Senin baban ' + rastgeleIsim.name + '!')
        .setImage(rastgeleIsim.image || gifUrl);
      message.channel.send(embed);
    } catch (error) {
      console.error('Giphy verileri alınırken bir hata oluştu:', error.message);
    }
  } else if (content.startsWith('annesil') && hasDesiredRole) {
    const args = content.slice(8).trim().split(' ');
    if (args.length < 1) return message.channel.send(':x: Geçersiz komut kullanımı. annesil İsim şeklinde girin.');
    const fullName = getFullName(args);
    const index = names.kadin.findIndex((item) => item.name === fullName);
    if (index === -1) {
      return message.channel.send(`:x: "${fullName}" anne ismi listede bulunamadı.`);
    }
    names.kadin.splice(index, 1);
    fs.writeFileSync('./names.json', JSON.stringify(names, null, 2));
    message.channel.send(`:female_sign: :x: "${fullName}" anne ismi listeden silindi.`);
  } else if (content.startsWith('babasil') && hasDesiredRole) {
    const args = content.slice(8).trim().split(' ');
    if (args.length < 1) return message.channel.send(':x: Geçersiz komut kullanımı. babasil İsim şeklinde girin.');
    const fullName = getFullName(args);
    const index = names.erkek.findIndex((item) => item.name === fullName);
    if (index === -1) {
      return message.channel.send(`:x: "${fullName}" baba ismi listede bulunamadı.`);
    }
    names.erkek.splice(index, 1);
    fs.writeFileSync('./names.json', JSON.stringify(names, null, 2));
    message.channel.send(`:male_sign: :x: "${fullName}" baba ismi listeden silindi.`);  
  } else if (content.startsWith('anneresim') && hasDesiredRole) {
    const args = content.slice(10).trim().split(' ');
    if (args.length < 2) return message.channel.send(':x: Geçersiz komut kullanımı. anneresim İsim [ResimLink] şeklinde girin.');
    const { fullName, image } = getFullNameAndImage(args);
    const index = names.kadin.findIndex((item) => item.name === fullName);
    if (index === -1) {
      return message.channel.send(`:x: "${fullName}" anne ismi listede bulunamadı.`);
    }
    names.kadin[index].image = image;
    fs.writeFileSync('./names.json', JSON.stringify(names, null, 2));
    message.channel.send(`:female_sign: :white_check_mark: "${fullName}" anne ismi için resim linki güncellendi.`);
  } else if (content.startsWith('babaresim') && hasDesiredRole) {
    const args = content.slice(10).trim().split(' ');
    if (args.length < 2) return message.channel.send(':x: Geçersiz komut kullanımı. babaresim İsim [ResimLink] şeklinde girin.');
    const { fullName, image } = getFullNameAndImage(args);
    const index = names.erkek.findIndex((item) => item.name === fullName);
    if (index === -1) {
      return message.channel.send(`:x: "${fullName}" baba ismi listede bulunamadı.`);
    }
    names.erkek[index].image = image;
    fs.writeFileSync('./names.json', JSON.stringify(names, null, 2));
    message.channel.send(`:male_sign: :white_check_mark: "${fullName}" baba ismi için resim linki güncellendi.`);
  }
});

client.login('DEGISTIR');