<?php

function get_totals() {
  $html = @file_get_contents('http://www.squaw.com/snowfall-tracker-2010-11');

  if (!$html) {
    return array();
  }

  // get season totals
  $season_totals = array();
  if (preg_match('/<h2>Season Cumulative Total<\/h2>.*<\/table>/Uims', $html, $matches)) {
    if (preg_match_all('/<h3>\s*(.+)\s*<\/h3>/Uims', $matches[0], $matches)) {
      $season_totals = $matches[1];
    }
  } else {
    echo "Didn't get cumulative totals data";
    return array();
  }

  $totals = array();
  #if (preg_match_all('/<tr .*>\s*<td .*>\s*<span class="date-display-single">\s*(.+)\s*<\/span>\s*<\/td>\s*<td .*>\s*(.+)\s*<\/td>\s*<td .*>\s*(.+)\s*<\/td>\s*<\/tr>/Uims', $html, $matches)) {
  $regex = '/<tr .*>\s*';
  $regex .= '<td>\s*<span class="date-display-single">\s*(.+)\s*<\/span>\s*<\/td>\s*';
  $regex .= '<td>\s*(.+)\s*<\/td>\s*';
  $regex .= '<td>\s*(.+)\s*<\/td>\s*';
  $regex .= '<td>\s*(.+)\s*<\/td>\s*';
  $regex .= '<td>\s*(.+)\s*<\/td>\s*';
  $regex .= '<\/tr>/Uims';
  if (preg_match_all($regex, $html, $matches)) {
    $dates = $matches[1];
    $e6200 = str_replace(' ', '', $matches[2]);
    $t6200 = str_replace(' ', '', $matches[3]);
    $e8200 = str_replace(' ', '', $matches[4]);
    $t8200 = str_replace(' ', '', $matches[5]);
    for ($i = 0; $i < count($dates); $i++) {
      $totals[] = array(
        'day' => $dates[$i],
        '6200n' => trim($e6200[$i]),
        '8200n' => trim($e8200[$i]),
        '6200t' => trim($t6200[$i]),
        '8200t' => trim($t8200[$i])
      );
    }
  }
  return $totals;
}

function get_last_seen() {
  $file = '/tmp/squawsnow_last.json';
  $last = null;

  if (file_exists($file)) {
    $last = json_decode(file_get_contents($file), true);
  }

  return $last;
}

function update_last_seen($data) {
  $file = '/tmp/squawsnow_last.json';
  return file_put_contents($file, json_encode($data));
}

function tweet($msg) {
  $msg = addcslashes($msg, '"');
  echo "Tweeting: $msg";

  $out = array();
  exec('twurl -d "status='.$msg.'" /1/statuses/update.xml', $out);
  #print_r($out);
  return;
}

$totals = get_totals();
if (!$totals) {
  echo "Received no data";
  return;
}
$current = $totals[0];
$last = get_last_seen();

if (!$last) {
  echo "Seeding last seen data";
  update_last_seen($current);
} else if (!$current['8200t']) {
  echo "Invalid data\n";
  print_r($current);
} else if ($current['6200t'] == $last['6200t'] && $current['8200t'] == $last['8200t']) {
  #echo "Nothing new\n";
  #print_r($current);
} else {
  $msg = $current['day']." — ";
  $msg .= "New: {$current['6200n']} at 6200', {$current['8200n']} at 8200' — ";
  $msg .= " Totals: {$current['6200t']}/{$current['8200t']}";
  echo tweet($msg);
  update_last_seen($current);
}

return;
?>

<table>
<?php foreach ($totals as $data): ?>
  <tr>
    <td><?php echo $data['day'] ?></td>
    <td><?php echo $data['6200n'] ?></td>
    <td><?php echo $data['8200n'] ?></td>
    <td><?php echo $data['6200t'] ?></td>
    <td><?php echo $data['8200t'] ?></td>
  </tr>
<? endforeach; ?>
</table>
