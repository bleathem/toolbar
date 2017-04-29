(function($, window) {
  var $pageInfo = $('.toolbar-pf-actions').siblings('.content-view-pf-pagination');
  var $tabPanes = $('.tab-pane');
  var $tableItems = $('#table').find('tbody tr');
  var $cardItems = $('#card').find('.card-pf-view');
  var $listItems = $('#list').find('.list-group-item');
  var $filter = $('#filter');
  var $filters = $('#filters');
  var $filterMenu = $('#filterMenu');

  function init () {
    var total = $tableItems.filter(':not(.filtered)').length;
    var pageSize = getPageSize();
    var pageTotal = Math.ceil(total/pageSize);
    //①15 selected 1-②15 of ③75 <1 of ④5>
    $pageInfo.find('.select-items-dropdown .dropdown-toggle').text('0 selected ');
    $pageInfo.find('.pagination-pf-items-current').text('1-' + (pageSize <= total ? pageSize : total));
    $pageInfo.find('.pagination-pf-items-total').text(total);
    $pageInfo.find('.pagination-pf-pages').text(pageTotal);

    $tabPanes.find('.select-items-dropdown .dropdown-toggle').text('0 selected ');
    $tabPanes.find('.pagination-pf-items-current').text('1-' + (pageSize <= total ? pageSize : total));
    $tabPanes.find('.pagination-pf-items-total').text(total);
    $tabPanes.find('.pagination-pf-pages').text(pageTotal);

    $tableItems.filter(':not(.filtered)').slice(0, pageSize).removeClass('hidden');
    $cardItems.filter(':not(.filtered)').slice(0, pageSize).parent().removeClass('hidden');
    $listItems.filter(':not(.filtered)').slice(0, pageSize).removeClass('hidden');
  }

  function updateSelectedTotal (count) {
    var selectedTotal = $pageInfo.find('.select-items-dropdown .dropdown-toggle').contents()[0];
    var tabSelectedTotal = $tabPanes.find('.select-items-dropdown .dropdown-toggle').contents();
    selectedTotal.textContent = count + ' selected ';
    tabSelectedTotal[0].textContent = count + ' selected ';
    tabSelectedTotal[2].textContent = count + ' selected ';
    tabSelectedTotal[4].textContent = count + ' selected ';
  }

  function toggleSelect (e) {
    updateSelectedTotal(getSelectedTotal() + (this.checked ? 1 : -1));
    var $activeTab = $tabPanes.filter('.active');
    var $checkbox = $(e.target);
    var index = 0;
    if ($activeTab.is('#table')) {
      index = $tableItems.index($checkbox.closest('tr'))
    } else if ($activeTab.is('#card')) {
      index = $cardItems.index($checkbox.closest('.card-pf-view'))
    } else {
      index = $listItems.index($checkbox.closest('.list-group-item'))
    }
    $tableItems.eq(index).toggleClass('selected', this.checked)
      .find('.table-view-pf-select').children(':checkbox').prop('checked', this.checked);
    $cardItems.eq(index).toggleClass('active', this.checked)
      .find('.card-pf-view-checkbox').children(':checkbox').prop('checked', this.checked);
    $listItems.eq(index).toggleClass('active', this.checked)
      .find('.list-view-pf-checkbox').children(':checkbox').prop('checked', this.checked);
  }

  function getCurrentPage () {
    return window.parseInt($('#-page')[0].value);
  }

  function getTotalPage () {
    return window.parseInt($pageInfo.find('.pagination-pf-pages').text());
  }

  function updateTotalPage (count) {
    $pageInfo.find('.pagination-pf-pages').text(count);
    $tabPanes.find('.pagination-pf-pages').text(count);
  }

  function getPageSize () {
    return window.parseInt($tabPanes.eq(0).find('.pagination-pf-pagesize .filter-option').text());
  }

  function getSelectedTotal () {
    return window.parseInt($pageInfo.find('.select-items-dropdown .dropdown-toggle').text());
  }

  function getItemsRange () {
    var range = $pageInfo.find('.pagination-pf-items-current').text().split('-');
    return { 'start': window.parseInt(range[0]), 'end': window.parseInt(range[1]) };
  }

  function updateItemsRange (start, end) {
    var newRange = start + '-' + end;
    $pageInfo.find('.pagination-pf-items-current').text(newRange);
    $tabPanes.find('.pagination-pf-items-current').text(newRange);
  }

  function updateCurrentPage (count) {
    $pageInfo.find('.pagination-pf-page').val(count);
    $tabPanes.find('.pagination-pf-page').val(count);
  }

  function updatePagiBtnsStatus () {
    var currentPage = getCurrentPage();
    var $prevBtn = $('.pagination-pf-back').children();
    var $nextBtn = $('.pagination-pf-forward').children();
    if (currentPage === 1) {
      $prevBtn.addClass('disabled');
      $nextBtn.removeClass('disabled');
    } else if (currentPage === getTotalPage() ) {
      $nextBtn.addClass('disabled');
      $prevBtn.removeClass('disabled');
    } else {
      $nextBtn.removeClass('disabled');
      $prevBtn.removeClass('disabled');
    }
  }

  function turnToNextPage (e) {
    e.preventDefault();
    var currentPage = getCurrentPage();
    var pageSize = getPageSize();
    var newPage = currentPage + 1;
    if (newPage <= getTotalPage()) {
      turnToAnyPage(newPage);
      updateCurrentPage(newPage);
      updatePagiBtnsStatus();
    }
  }

  function turnToPreviousPage (e) {
    e.preventDefault();
    var newPage = getCurrentPage() - 1;
    if (newPage > 0) {
      turnToAnyPage(newPage);
      updateCurrentPage(newPage);
      updatePagiBtnsStatus();
    }
  }

  function turnToAnyPage (page) {
    var pageSize = getPageSize();
    var startIndex = pageSize * (page - 1);
    var endIndex = pageSize * page > $tableItems.length ? $tableItems.length : pageSize * page;
    $tableItems.filter(':not(.hidden)').addClass('hidden');
    $tableItems.slice(startIndex, endIndex).removeClass('hidden');
    $cardItems.parent().filter(':not(.hidden)').addClass('hidden');
    $cardItems.filter(':not(.filtered)').slice(startIndex, endIndex).parent().removeClass('hidden');
    $listItems.filter(':not(.hidden)').addClass('hidden');
    $listItems.slice(startIndex, endIndex).removeClass('hidden');
    updateItemsRange(startIndex + 1, endIndex);
    updatePagiBtnsStatus();
  }

  function changePage (e) {
    if (e.which === 13) {
      e.preventDefault();
      if (this.value.match(/^\d+$/)) {
        var newPage = window.parseInt(this.value);
        var totalPage = getTotalPage();
        if (newPage < 1 || newPage > totalPage) {
          window.alert('Please enter a number greater than or equal to 1 and less than or equal to ' + totalPage + '.');
        } else {
          $pageInfo.find('.pagination-pf-page').val(newPage);
          $tabPanes.find('.pagination-pf-page').val(newPage);
          turnToAnyPage(newPage);
        }
      } else {
        window.alert('Please enter positive integer.');
      }
    }
  }

  function batchSelect (e) {
    e.preventDefault()
    var $this = $(this);
    var option = $this.text();
    if (option.indexOf('Page') > -1) {
      $tableItems.filter(':not(.hidden)').addClass('selected')
        .find('.table-view-pf-select').children(':checkbox').prop('checked', true);
      $cardItems.parent().filter(':not(.hidden)').children().addClass('active')
        .find('.card-pf-view-checkbox').children(':checkbox').prop('checked', true);
      $listItems.filter(':not(.hidden)').addClass('active')
        .find('.list-view-pf-checkbox').children(':checkbox').prop('checked', true);
    }
    if (option.indexOf('All') > -1) {
      $tableItems.addClass('selected')
        .find('.table-view-pf-select').children(':checkbox').prop('checked', true);
      $cardItems.addClass('active')
        .find('.card-pf-view-checkbox').children(':checkbox').prop('checked', true);
      $listItems.addClass('active')
        .find('.list-view-pf-checkbox').children(':checkbox').prop('checked', true);
    }
    if (option.indexOf('Clear') > -1) {
      $tableItems.filter('.selected').removeClass('selected')
        .find('.table-view-pf-select').children(':checkbox').prop('checked', false);
      $cardItems.filter('.active').removeClass('active')
        .find('.card-pf-view-checkbox').children(':checkbox').prop('checked', false);
      $listItems.filter('.active').removeClass('active')
        .find('.list-view-pf-checkbox').children(':checkbox').prop('checked', false);
    }
    updateSelectedTotal($cardItems.filter('.active').length);
  }

  function changePageSize (e) {
    var $this = $(this);
    if (!$this.parent().is('.selected')) {
      var index = $this.parent().data('originalIndex');
      $tabPanes.find('.pagination-pf-pagesize ul.dropdown-menu').children('[data-original-index="' + index + '"]')
        .addClass('selected').siblings('.selected').removeClass('selected');
      $tabPanes.find('.pagination-pf-pagesize .filter-option').text($this.text());
      turnToAnyPage(1);
      updateCurrentPage(1);
      updateTotalPage(Math.ceil($tableItems.length/window.parseInt($this.text())));
      updatePagiBtnsStatus();
    }
  }

  function filterChange(e) {
    if (e.keyCode == 13) {
      e.preventDefault();
    }
    setTimeout(function() {
      console.log($filter.data('key'), $filter.val());
      updateFilterState($filter.data('key'), $filter.val().toLowerCase());
      applyFilters();
    });
  }

  function applyFilters() {
    $tableItems.removeClass('filtered');
    $cardItems.removeClass('filtered');
    $cardItems.parent().removeClass('filtered');
    $listItems.removeClass('filtered');

    let filters = $filters.data('saved') || {};
    for (key in filters) {
      let value = filters[key];
      $tableItems.filter(function() {
        return !$(this).data(key).toLowerCase().startsWith(value);
      }).addClass('filtered');
      $cardItems.filter(function() {
        return !$(this).data(key).toLowerCase().startsWith(value);
      }).addClass('filtered').parent().addClass('filtered');
      $listItems.filter(function() {
        return !$(this).data(key).toLowerCase().startsWith(value);
      }).addClass('filtered');
    }
    init();
  }

  function updateFilterState(key, value) {
    let saved = $filters.data('saved') || {};
    if (value === null || !value.length) {
      delete saved[key];
    } else {
      saved[key] = value;
    }
    $filters.data('saved', saved);
    updateFilterLabels(saved);
  }

  function updateFilterLabels(filters) {
    let $list = $filters.find('ul');
    $list.children().remove();
    for (_key in filters) {
      let _value = filters[_key];
      let html = `<li style="display: block;" data-key="${_key}"><span class="label label-info">${_key}: ${_value}<a href="#remove"><span class="pficon pficon-close"></span></a></span></li>`;
      $list.append(html);
    }
    let numbers = {
      0: 'Zero',
      1: 'One',
      2: 'Two',
      3: 'Three',
      4: 'Four'
    }
    let text = '';
    let count = Object.keys(filters).length;
    if (count > 0) {
      text = numbers[count] + ' Filter';
      text += count > 1 ? 's' : '';
    } else {
      $filters.collapse('hide');
    }
    $filters.parent().find('a[href="#filters"]').text(text);
  }

  function removeFilter(e) {
    let $filter = $(this).parents('li');
    let key = $filter.data('key');
    updateFilterState(key, null);
    applyFilters();
  }

  function removeAllFilters(e) {
    $filters.data('saved', {});
    updateFilterState(null, null);
    applyFilters();
  }

  function changeFilterKey(e) {
    $this = $(this);
    let key = $this.data('key');
    let label = $this.data('label');
    $this.parents('.input-group-btn').find('button .filterlabel').text(label);
    $filter.attr('placeholder', `Filter By ${label}...`);
    $filter.data('key', key);
    $filter.val('');
    $filterMenu.children().removeClass('selected');
    $this.addClass('selected');
  }

  $(function () {
    init();

    $('.pagination-pf-pagesize').on('click', 'li a', changePageSize);
    $('.table-view-pf-select, .card-pf-view-checkbox, .list-view-pf-checkbox').on('change', 'input', toggleSelect);
    $('.pagination-pf-forward').on('click', 'a', turnToNextPage);
    $('.pagination-pf-back').on('click', 'a', turnToPreviousPage);
    $('.select-items-dropdown').find('.dropdown-menu').on('click', 'a', batchSelect);
    $filter.on('keydown', filterChange);
    $filters.on('click', 'a[href="#remove"]', removeFilter);
    $filters.on('click', 'a[href="#clear"]', removeAllFilters);
    $filterMenu.on('click', 'li', changeFilterKey);
    $pageInfo.on('keydown', '.pagination-pf-page', changePage);
    $tabPanes.on('keydown', '.pagination-pf-page', changePage);
  });

}(jQuery, window));